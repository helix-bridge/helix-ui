import BN from 'bn.js';
import { upperFirst } from 'lodash';
import { Observable } from 'rxjs';
import { Tx } from 'shared/model';
import { entrance } from 'shared/utils/connection';
import { toWei } from 'shared/utils/helper';
import { signAndSendExtrinsic } from 'shared/utils/tx';
import { IssuingPayload, RedeemPayload } from '../model';

export function redeem(value: IssuingPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const api = entrance.polkadot.getInstance(direction.from.meta.provider);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
  const WEIGHT = '8000000000';
  const module = `from${upperFirst(to.meta.name)}Issuing`;
  const extrinsic = api.tx[module].burnAndRemoteUnlock(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

  return signAndSendExtrinsic(api, sender, extrinsic);
}

export function issuing(value: RedeemPayload, fee: BN): Observable<Tx> {
  const { sender, recipient, direction } = value;
  const { from: departure, to } = direction;
  const api = entrance.polkadot.getInstance(direction.from.meta.provider);
  const amount = new BN(toWei({ value: departure.amount, decimals: departure.decimals })).sub(fee).toString();
  const WEIGHT = '8000000000';
  const module = `to${to.host.split('-').map(upperFirst).join('')}Backing`;
  const extrinsic = api.tx[module].lockAndRemoteIssue(String(to.meta.specVersion), WEIGHT, amount, fee, recipient);

  return signAndSendExtrinsic(api, sender, extrinsic);
}
