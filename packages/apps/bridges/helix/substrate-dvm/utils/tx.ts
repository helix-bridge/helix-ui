import { u8aToHex } from '@polkadot/util';
import BN from 'bn.js';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs/internal/observable/empty';
import { from as rxFrom } from 'rxjs/internal/observable/from';
import { mergeMap } from 'rxjs/internal/operators/mergeMap';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { SUBSTRATE_DVM_WITHDRAW } from 'shared/config/env';
import { Tx } from 'shared/model';
import { entrance, waitUntilConnected } from 'shared/utils/connection';
import { dvmAddressToAccountId, convertToSS58 } from 'shared/utils/helper/address';
import { toWei } from 'shared/utils/helper/balance';
import { typeRegistryFactory } from 'shared/utils/helper/huge';
import { isRing } from 'shared/utils/helper/validator';
import { genEthereumTransactionObs, signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { validationObsFactory } from '../../../../utils/tx';
import { TransferPayload, WithdrawPayload } from '../model';

export function issue(value: TransferPayload): Observable<Tx> {
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
  const {
    recipient,
    sender,
    direction: { from, to },
  } = value;

  return rxFrom(typeRegistryFactory()).pipe(
    mergeMap((TypeRegistry) => {
      const registry = new TypeRegistry();
      const accountId = registry.createType('AccountId', convertToSS58(recipient, to.meta.ss58Prefix)).toHex();

      if (accountId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return EMPTY;
      }

      const web3 = entrance.web3.currentProvider;
      const api = entrance.polkadot.getInstance(from.meta.provider);

      return rxFrom(waitUntilConnected(api)).pipe(
        mergeMap(async () => {
          const amount = toWei({ value: from.amount, decimals: 9 });
          const transfer = isRing(from.symbol) ? api.tx.balances.transfer : api.tx.kton.transfer;

          return transfer(recipient, amount);
        }),
        switchMap((extrinsic) =>
          rxFrom(
            web3.estimateGas({
              from: sender,
              to: SUBSTRATE_DVM_WITHDRAW,
              data: u8aToHex(extrinsic.method.toU8a()),
            })
          ).pipe(
            switchMap((gas) =>
              genEthereumTransactionObs({
                from: sender,
                to: SUBSTRATE_DVM_WITHDRAW,
                data: u8aToHex(extrinsic.method.toU8a()),
                gasLimit: gas.toString(),
              })
            )
          )
        )
      );
    })
  );
}

const genValidations = ({ balance, amount }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
];

export const validate = validationObsFactory(genValidations);
