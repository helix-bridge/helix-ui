import BN from 'bn.js';
import upperFirst from 'lodash/upperFirst';
import { Observable } from 'rxjs';
import { RequiredPartial, Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { TxValidationMessages } from '../../../../config/validation';
import { TxValidation } from '../../../../model';
import { validationObsFactory } from '../../../../utils/tx';
import { IssuingPayload, RedeemPayload } from '../model';

export function redeem(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const api = entrance.polkadot.getInstance(direction.from.meta.provider);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
  const WEIGHT = '10000000000';
  const section = `from${upperFirst(to.meta.name)}Issuing`;
  const extrinsic = api.tx[section].burnAndRemoteUnlock(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export function issue(value: RedeemPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const api = entrance.polkadot.getInstance(direction.from.meta.provider);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
  const WEIGHT = '10000000000';
  const section = `to${to.host.split('-').map(upperFirst).join('')}Backing`;
  const extrinsic = api.tx[section].lockAndRemoteIssue(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

const genValidations = ({
  balance,
  amount,
  dailyLimit,
}: RequiredPartial<TxValidation, 'dailyLimit' | 'balance' | 'amount'>): [boolean, string][] => [
  [balance.lt(amount), TxValidationMessages.balanceLessThanAmount],
  [dailyLimit.lt(amount), TxValidationMessages.dailyLimitLessThanAmount],
];

export const validate = validationObsFactory(genValidations);
