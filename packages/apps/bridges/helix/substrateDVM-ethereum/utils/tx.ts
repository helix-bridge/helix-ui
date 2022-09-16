import { BN, BN_ZERO } from '@polkadot/util';
import { Observable } from 'rxjs';
import { Tx } from 'shared/model';
import { toWei } from 'shared/utils/helper/balance';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { getBridge, validationObsFactory } from '../../../../utils';
import { IssuingPayload, RedeemPayload } from '../model';
import backingAbi from '../config/backing.json';
import mappingTokenAbi from '../config/mappingTokenFactory.json';

export function issue(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

  return genEthereumContractTxObs(
    bridge.config.contracts!.backing,
    (contract) =>
      contract.methods.lockAndRemoteIssuingNative(recipient, amount, {
        from: sender,
        value: fee.toString(),
      }),
    backingAbi
  );
}

export function redeem(value: RedeemPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();

  return genEthereumContractTxObs(
    bridge.config.contracts!.issuing,
    (contract) =>
      contract.methods.burnAndRemoteUnlockNative(recipient, amount, {
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
