import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { Observable } from 'rxjs';
import { Tx } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import { AbiItem } from 'web3-utils';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';
import { IssuingPayload, RedeemPayload } from '../model';

export function issuing(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
  const gasLimit = '1000000';

  return genEthereumContractTxObs(
    bridge.config.contracts!.issuing,
    (contract) =>
      contract.methods
        .lockAndRemoteIssuing(departure.meta.specVersion, gasLimit, departure.address, recipient, amount)
        .send({ from: sender, value: fee.toString() }),
    backingAbi as AbiItem[]
  );
}

export function redeem(value: RedeemPayload, fee: BN): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: { from: departure, to },
  } = value;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
  const gasLimit = '1000000';

  return genEthereumContractTxObs(
    bridge.config.contracts!.redeem,
    (contract) =>
      contract.methods
        .burnAndRemoteUnlock(departure.meta.specVersion, gasLimit, departure.address, recipient, amount)
        .send({ from: sender, value: fee.toString() }),
    burnAbi as AbiItem[]
  );
}

export const genValidations = ({ balance, amount, dailyLimit, allowance, fee }: TxValidation): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [!!dailyLimit && dailyLimit.lt(amount), TxValidationMessages.dailyLimitLessThanAmount],
  [!!allowance && allowance?.lt(amount), TxValidationMessages.allowanceLessThanAmount],
  [!!fee && fee?.lt(BN_ZERO), TxValidationMessages.invalidFee],
];

export const validate = validationObsFactory(genValidations);
