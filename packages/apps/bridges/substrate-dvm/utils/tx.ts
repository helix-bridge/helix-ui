import { TypeRegistry } from '@polkadot/types';
import BN from 'bn.js';
import { EMPTY, Observable } from 'rxjs';
import { abi } from 'shared/config/abi';
import { WITHDRAW_ADDRESS } from 'shared/config/address';
import { Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { convertToDvm, convertToSS58, dvmAddressToAccountId, isRing, toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs, genEthereumTransactionObs, signAndSendExtrinsic } from 'shared/utils/tx';
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
  const amount = toWei({ value: from.amount, decimals: 18 });
  const accountId = registry.createType('AccountId', convertToSS58(recipient, to.meta.ss58Prefix)).toHex();

  if (accountId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return EMPTY;
  }

  if (isRing(from.symbol)) {
    return genEthereumTransactionObs({
      from: sender,
      to: WITHDRAW_ADDRESS,
      data: accountId,
      value: amount,
      gas: 55000,
    });
  }

  const withdrawalAddress = convertToDvm(recipient);

  return genEthereumContractTxObs(
    from.address,
    (contract) => contract.methods.withdraw(withdrawalAddress, amount).send({ from: sender }),
    abi.ktonABI
  );
}
