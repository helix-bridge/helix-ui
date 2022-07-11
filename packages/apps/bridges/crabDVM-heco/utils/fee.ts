import BN from 'bn.js';
import { Bridge } from 'shared/model';

export async function getRedeemFee(bridge: Bridge): Promise<BN | null> {
  console.log('Unfinished getRedeemFee for birdge', bridge);
  return new BN(0);
}

export async function getIssuingFee(bridge: Bridge): Promise<BN | null> {
  console.log('Unfinished getIssuing for birdge', bridge);
  return new BN(0);
}
