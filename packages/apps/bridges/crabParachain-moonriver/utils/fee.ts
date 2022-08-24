import BN from 'bn.js';
import { Bridge } from 'shared/model';

export async function getRedeemFee(_: Bridge): Promise<BN | null> {
  return new BN('3200000000000000000');
}

export async function getIssuingFee(_: Bridge): Promise<BN | null> {
  return new BN('11800000000000000000');
}
