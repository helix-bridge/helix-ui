import BN from 'bn.js';
import { BridgeBase } from 'shared/model';

export async function getRedeemFee(_: BridgeBase): Promise<BN | null> {
  return new BN('3200000000000000000');
}

export async function getIssuingFee(_: BridgeBase): Promise<BN | null> {
  return new BN('11800000000000000000');
}
