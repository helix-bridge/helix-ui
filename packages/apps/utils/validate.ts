import { isAddress } from 'ethers/lib/utils';
import { CrossOverview, Network, PolkadotChainConfig, TokenWithBridgesInfo } from 'shared/model';
import { isSS58Address } from 'shared/utils/helper/validator';
import { isPolkadotNetwork } from 'shared/utils/network/network';
import { chainConfigs } from './network/network';

export const isTransferableTokenPair = (token1: TokenWithBridgesInfo, token2: TokenWithBridgesInfo): boolean => {
  const check = (token: TokenWithBridgesInfo) => (item: CrossOverview) =>
    item.partner.name === token.host && item.partner.symbol === token.symbol;

  const inToken1 = check(token1);
  const inToken2 = check(token2);
  const overviewList1 = token1.cross.filter(inToken2);
  const overviewList2 = token2.cross.filter(inToken1);

  return !!overviewList1.length && !!overviewList2.length;
};

export const isValidAddressStrict = (address: string, network: Network): boolean => {
  if (network === 'ethereum') {
    return isAddress(address);
  }

  if (network === 'polkadot') {
    return isSS58Address(address, 0);
  }

  if (isPolkadotNetwork(network)) {
    const target = chainConfigs.find((item) => item.name === network) as PolkadotChainConfig;

    return isSS58Address(address, target.ss58Prefix);
  }

  return false;
};
