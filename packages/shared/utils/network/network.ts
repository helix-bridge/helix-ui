import { chain as lodashChain, pick, upperFirst } from 'lodash';
import { SYSTEM_ChAIN_CONFIGURATIONS } from '../../config/network';
import { knownDVMNetworks, knownEthereumNetworks, knownPolkadotNetworks } from '../../config/network/category';
import { ChainConfig, Network, PolkadotChainConfig } from '../../model';
import { getCustomNetworkConfig } from '../helper/storage';
import { crossChainGraph } from './graph';

export const chainConfigs = lodashChain(crossChainGraph)
  .map(([departure, arrivals]) => [departure, ...arrivals])
  .filter((item) => item.length > 1)
  .flatten()
  .unionWith((pre, next) => pre === next)
  .map((vertices) => {
    let config = SYSTEM_ChAIN_CONFIGURATIONS.find((item) => vertices === item.name);

    if (!config) {
      throw new Error(`Can not find ${vertices} network configuration`);
    } else {
      const customConfigs = getCustomNetworkConfig();

      if (customConfigs[config.name]) {
        config = { ...config, ...pick(customConfigs[config.name], Object.keys(config)) } as PolkadotChainConfig;
      }
    }

    return config;
  })
  .sortBy((item) => item.name)
  .valueOf();

const isSpecifyNetwork = (known: Network[]) => (network: ChainConfig | Network | null | undefined) => {
  if (!network) {
    return false;
  }

  return known.some((item) => item === network || item === (network as ChainConfig)?.name);
};

export const isPolkadotNetwork = isSpecifyNetwork(knownPolkadotNetworks);

export const isDVMNetwork = isSpecifyNetwork(knownDVMNetworks);

export const isEthereumNetwork = isSpecifyNetwork(knownEthereumNetworks);

export function getChainConfig(name: Network | null | undefined): ChainConfig {
  if (!name) {
    throw new Error(`You must pass a 'name' parameter to find the chain config`);
  }

  const result = chainConfigs.find((item) => item.name === name);

  if (!result) {
    throw new Error(`Can not find the chain config by ${name}`);
  }

  return result;
}

export function getDisplayName(config: ChainConfig | null): string {
  if (!config) {
    return 'unknown';
  }

  if (isDVMNetwork(config.name)) {
    return `${upperFirst(config.name.split('-')[0])} Smart Chain`;
  }

  if (config.name.includes('parachain')) {
    return config.name.split('-').map(upperFirst).join(' ');
  }

  return upperFirst(config.name);
}
