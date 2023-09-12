import { isAddress } from 'ethers/lib/utils';
import { Network, PolkadotChainConfig, TokenWithBridgesInfo } from 'shared/model';
import { isSS58Address } from 'shared/utils/helper/validator';
import { isPolkadotNetwork } from 'shared/utils/network/network';
import { chainConfigs } from './network';

export const isTransferableTokenPair = (fromToken: TokenWithBridgesInfo, toToken: TokenWithBridgesInfo): boolean => {
  return fromToken.cross.some(({ partner }) => partner.name === toToken.host && partner.symbol === toToken.symbol);
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
