import { ethereumConfig, arbitrumConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { arbitrumGoerliConfig, goerliConfig } from 'shared/config/network';
import { EthereumArbitrumBridgeConfig } from '../model';

const ethereumArbitrumConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
    gatewayAddress: '',
  },
};

const arbitrumGoerliGoerliConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '0x4c7708168395aea569453fc36862d2ffcdac588c',
    gatewayAddress: '0x715D99480b77A8d9D603638e593a539E21345FdF',
    helixDaoAddress: '0x3B9E571AdeCB0c277486036D6097E9C2CCcfa9d9',
  },
};

export const ethereumArbitrum = new BridgeBase(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'l1tol2',
});

export const arbitrumGoerliL2 = new BridgeBase(arbitrumGoerliConfig, goerliConfig, arbitrumGoerliGoerliConfig, {
  name: 'ethereum-arbitrum',
  category: 'l1tol2',
});
