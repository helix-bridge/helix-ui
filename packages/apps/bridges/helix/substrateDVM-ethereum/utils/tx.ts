import { BN, BN_ZERO } from '@polkadot/util';
import last from 'lodash/last';
import { Observable } from 'rxjs';
import { HelixHistoryRecord, Tx } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { getBridge, validationObsFactory } from '../../../../utils';
import backingAbi from '../config/backing.json';
import guardAbi from '../config/guard.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';
import { IssuingPayload, RedeemPayload, SubstrateDVMEthereumBridgeConfig } from '../model';

export function issue(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals }));

  return genEthereumContractTxObs(
    bridge.config.contracts!.backing,
    (contract) =>
      contract.lockAndRemoteIssuingNative(recipient, amount.toString(), {
        from: sender,
        value: amount.add(fee).toString(),
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
        value: amount.add(fee).toString(),
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
  const { endTime, recvTokenAddress, recvAmount, guardSignatures, recipient, fromChain, toChain, sender } = record;
  const id = last(record.id.split('-'));
  const signatures = last(guardSignatures?.split('-'));
  const bridge = getBridge<SubstrateDVMEthereumBridgeConfig>([fromChain, toChain]);

  return genEthereumContractTxObs(
    bridge.config.contracts!.guard,
    (contract) => contract.claim(id, endTime, recvTokenAddress, recipient, recvAmount, [signatures], { from: sender }),
    guardAbi
  );
};
