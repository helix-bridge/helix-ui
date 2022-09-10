import upperFirst from 'lodash/upperFirst';
import {
  knownDVMNetworks,
  knownEthereumNetworks,
  knownParachainNetworks,
  knownPolkadotNetworks,
} from 'shared/config/network';
import { ChainConfig, Network } from 'shared/model';

const isSpecifyNetwork = (known: Network[]) => (network: ChainConfig | Network | null | undefined) => {
  if (!network) {
    return false;
  }

  return known.some((item) => item === network || item === (network as ChainConfig)?.name);
};

export const isPolkadotNetwork = isSpecifyNetwork(knownPolkadotNetworks);

export const isDVMNetwork = isSpecifyNetwork(knownDVMNetworks);

export const isEthereumNetwork = isSpecifyNetwork(knownEthereumNetworks);

export const isParachainNetwork = isSpecifyNetwork(knownParachainNetworks);

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

  return config.fullName ?? `${upperFirst(config.name)} Chain`;
}
