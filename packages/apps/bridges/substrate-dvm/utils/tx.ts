import { abi } from 'shared/config/abi';
import { Tx, DVMChainConfig, CrossChainDirection, PolkadotChainConfig } from 'shared/model';
import {
  dvmAddressToAccountId,
  isRing,
  signAndSendExtrinsic,
  convertToSS58,
  genEthereumTransactionObs,
  convertToDvm,
  genEthereumContractTxObs,
} from 'shared/utils';
import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import BN from 'bn.js';
import { EMPTY, Observable } from 'rxjs';
import { SmartTxPayload } from '../model/cross-chain';

export function issuing(value: SmartTxPayload, api: ApiPromise): Observable<Tx> {
  const { sender, recipient, amount, asset } = value;
  const toAccount = dvmAddressToAccountId(recipient).toHuman();
  const extrinsic = isRing(asset)
    ? api.tx.balances.transfer(toAccount, new BN(amount))
    : api.tx.kton.transfer(toAccount, new BN(amount));

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export function redeem(
  value: SmartTxPayload<DVMChainConfig>,
  direction: CrossChainDirection<DVMChainConfig, PolkadotChainConfig>
): Observable<Tx> {
  const registry = new TypeRegistry();
  const { recipient, asset, sender, amount } = value;
  const { from, to } = direction;
  const accountId = registry.createType('AccountId', convertToSS58(recipient, to.ss58Prefix)).toHex();

  if (accountId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    return EMPTY;
  }

  if (isRing(asset)) {
    return genEthereumTransactionObs({
      from: sender,
      to: from.dvm.smartWithdrawRing,
      data: accountId,
      value: amount,
      gas: 55000,
    });
  }

  const withdrawalAddress = convertToDvm(recipient);

  return genEthereumContractTxObs(
    from.dvm.smartKton,
    (contract) => contract.methods.withdraw(withdrawalAddress, amount).send({ from: sender }),
    abi.ktonABI
  );
}
