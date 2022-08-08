import { TypeRegistry } from '@polkadot/types';
import { u8aToHex } from '@polkadot/util';
import BN from 'bn.js';
import { EMPTY, from as rxFrom, mergeMap, Observable, switchMap } from 'rxjs';
import { abi } from 'shared/config/abi';
import { SUBSTRATE_DVM_WITHDRAW } from 'shared/config/env';
import { Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { convertToDvm, convertToSS58, dvmAddressToAccountId, isRing, toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs, genEthereumTransactionObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import { TransferPayload, WithdrawPayload } from '../model';

export function issuing(value: TransferPayload): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: { from },
  } = value;
  const toAccount = dvmAddressToAccountId(recipient).toHuman();
  const amount = toWei(from);
  const api = entrance.polkadot.getInstance(from.meta.provider);
  const extrinsic = isRing(from.symbol)
    ? api.tx.balances.transfer(toAccount, new BN(amount))
    : api.tx.kton.transfer(toAccount, new BN(amount));

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export function redeem(value: WithdrawPayload): Observable<Tx> {
  const registry = new TypeRegistry();
  const {
    recipient,
    sender,
    direction: { from, to },
  } = value;
  const accountId = registry.createType('AccountId', convertToSS58(recipient, to.meta.ss58Prefix)).toHex();

  if (accountId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return EMPTY;
  }

  const web3 = entrance.web3.getInstance(entrance.web3.defaultProvider);
  const api = entrance.polkadot.getInstance(from.meta.provider);

  if (isRing(from.symbol)) {
    return rxFrom(waitUntilConnected(api)).pipe(
      mergeMap(async () => api.tx.balances.transfer(recipient, toWei({ value: from.amount, decimals: 9 }))),
      switchMap((extrinsic) =>
        rxFrom(
          web3.eth.estimateGas({ from: sender, to: SUBSTRATE_DVM_WITHDRAW, data: u8aToHex(extrinsic.method.toU8a()) })
        ).pipe(
          switchMap((gas) =>
            genEthereumTransactionObs({
              from: sender,
              to: SUBSTRATE_DVM_WITHDRAW,
              data: u8aToHex(extrinsic.method.toU8a()),
              gas,
            })
          )
        )
      )
    );
  }

  const withdrawalAddress = convertToDvm(recipient);

  return rxFrom(waitUntilConnected(api)).pipe(
    mergeMap(async () => api.tx.balances.transfer(recipient, toWei({ value: from.amount, decimals: 9 }))),
    switchMap((extrinsic) =>
      rxFrom(
        web3.eth.estimateGas({ from: sender, to: SUBSTRATE_DVM_WITHDRAW, data: u8aToHex(extrinsic.method.toU8a()) })
      ).pipe(
        switchMap((gas) =>
          genEthereumContractTxObs(
            from.address,
            (contract) => contract.methods.withdraw(withdrawalAddress, toWei(from)).send({ from: sender, gas }),
            abi.ktonABI
          )
        )
      )
    )
  );
}

const genValidations = ({ balance, amount }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
];

export const validate = validationObsFactory(genValidations);
