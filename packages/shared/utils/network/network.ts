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
