import { BN_ZERO } from '@polkadot/util';
import BN from 'bn.js';
import { Observable } from 'rxjs';
import { Tx } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';
import { convertToDvm, toWei } from 'shared/utils/helper';
import { genEthereumContractTxObs } from 'shared/utils/tx';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { TxValidationMessages } from '../../../config/validation';
import { TxValidation } from '../../../model';
import { validationObsFactory } from '../../../utils/tx';
import { IssuingPayload, RedeemPayload } from '../model';
import backingAbi from '../config/s2sv2backing.json';
import burnAbi from '../config/s2sv2burn.json';

export function issuing(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const bridge = getBridge([departure.meta, to.meta]);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).toString();
  const gasLimit = '1000000';

  console.log('🚀 ~ file: tx.ts ~ line 22 ~ issuing ~ amount', amount, fee.toString());

  return genEthereumContractTxObs(
    bridge.config.contracts!.issuing,
    (contract) =>
      contract.methods
        .lockAndRemoteIssuing(departure.meta.specVersion, gasLimit, departure.address, recipient, amount)
        .send({ from: sender, value: fee.toString() }),
    backingAbi as AbiItem[]
  );
}

export function redeem(value: RedeemPayload): Observable<Tx> {
  const {
    sender,
    recipient,
    direction: { from: departure, to },
  } = value;
  const receiver = Web3.utils.hexToBytes(convertToDvm(recipient));
  const gasLimit = '1000000';
  const bridge = getBridge([departure.meta, to.meta]);

  return genEthereumContractTxObs(
    bridge.config.contracts!.redeem,
    (contract) =>
      contract.methods
        .burnAndRemoteUnlock(
          departure.meta.specVersion,
          gasLimit,
          departure.address,
          receiver,
          toWei({ value: departure.amount })
        )
        .send({ from: sender }),
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
