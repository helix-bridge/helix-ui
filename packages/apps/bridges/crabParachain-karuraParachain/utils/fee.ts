import BN from 'bn.js';
import { Bridge, CrossChainDirection } from 'shared/model';
import { getBridge } from 'shared/utils/bridge';

async function getRedeemFee(_: Bridge): Promise<BN> {
  return new BN('3200000000000000000');
}

async function getIssuingFee(_: Bridge): Promise<BN> {
  return new BN('92696000000000000');
}

export async function getFee(direction: CrossChainDirection): Promise<BN> {
  const bridge = getBridge(direction);
  if (bridge.isIssuing(direction.from.meta, direction.to.meta)) {
    return getIssuingFee(bridge);
  } else {
    return getRedeemFee(bridge);
  }
}
