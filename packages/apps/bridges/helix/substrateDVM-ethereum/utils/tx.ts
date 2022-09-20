import { BN, BN_ZERO } from '@polkadot/util';
import last from 'lodash/last';
import { from, Observable, switchMap } from 'rxjs';
import { HelixHistoryRecord, Tx } from 'shared/model';
import { isMetamaskChainConsistent } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { getBridge, isSubstrateDVM2Ethereum, validationObsFactory } from '../../../../utils';
import { getChainConfig } from '../../../../utils/network';
import backingAbi from '../config/backing.json';
import guardAbi from '../config/guard.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';
import { IssuingPayload, RedeemPayload, SubstrateDVMEthereumBridgeConfig } from '../model';
import { getFee } from './fee';

export function issue(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));

  return genEthereumContractTxObs(
    bridge.config.contracts!.backing,
    (contract) =>
      contract.lockAndRemoteIssuingNative(recipient, amount.sub(fee).toString(), {
        from: sender,
        value: amount.toString(),
      }),
    backingAbi
  );
}

export function redeem(value: RedeemPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));

  return genEthereumContractTxObs(
    bridge.config.contracts!.issuing,
    (contract) =>
      contract.burnAndRemoteUnlockNative(recipient, amount.toString(), {
        from: sender,
        value: fee.toString(),
      }),
    mappingTokenAbi
  );
}

const genValidations = ({ balance, amount, dailyLimit, allowance, fee }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!dailyLimit && dailyLimit.lt(amount), TxValidationMessages.dailyLimitLessThanAmount],
  [!!allowance && allowance?.lt(amount), TxValidationMessages.allowanceLessThanAmount],
  [!!fee && fee?.lt(BN_ZERO), TxValidationMessages.invalidFee],
];

export const validate = validationObsFactory(genValidations);

export const claim = (record: HelixHistoryRecord) => {
  const {
    messageNonce,
    endTime,
    recvTokenAddress,
    recvAmount,
    guardSignatures,
    recipient,
    fromChain,
    toChain,
    sender,
  } = record;
  const signatures = guardSignatures?.split('-').slice(1);
  const bridge = getBridge<SubstrateDVMEthereumBridgeConfig>([fromChain, toChain]);

  return isMetamaskChainConsistent(getChainConfig(toChain)).pipe(
    switchMap(() =>
      genEthereumContractTxObs(
        bridge.config.contracts!.guard,
        (contract) =>
          contract.claim(messageNonce, endTime, recvTokenAddress, recipient, recvAmount, signatures, { from: sender }),
        guardAbi
      )
    )
  );
};

export const refund = (record: HelixHistoryRecord) => {
  const { sender, sendTokenAddress, sendAmount, fromChain, toChain } = record;
  const id = last(record.id.split('-'));
  const bridge = getBridge<SubstrateDVMEthereumBridgeConfig>([fromChain, toChain]);
  const fromChainConfig = getChainConfig(toChain);
  const toChainConfig = getChainConfig(fromChain);

  const { contractAddress, abi, method } = isSubstrateDVM2Ethereum(fromChain, toChain)
    ? { contractAddress: bridge.config.contracts!.issuing, abi: mappingTokenAbi, method: 'remoteUnlockFailure' }
    : { contractAddress: bridge.config.contracts!.backing, abi: backingAbi, method: 'remoteIssuingFailure' };

  return isMetamaskChainConsistent(getChainConfig(toChain)).pipe(
    switchMap(() => from(getFee({ from: { meta: fromChainConfig }, to: { meta: toChainConfig } }))),
    switchMap((fee) => {
      return genEthereumContractTxObs(
        contractAddress,
        (contract) =>
          contract[method](id, sendTokenAddress, sender, sendAmount, {
            from: sender,
            value: fee?.toString(),
          }),
        abi
      );
    })
  );
};
