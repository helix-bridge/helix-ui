import { ethereumConfig, arbitrumConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { arbitrumGoerliConfig, goerliConfig } from 'shared/config/network';
import { EthereumArbitrumBridgeConfig } from '../model';

const ethereumArbitrumConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    issuing: '0x0000000000000000000000000000000000000000',
    backing: '0x72ce9c846789fdb6fc1f34ac4ad25dd9ef7031ef',
    gatewayAddress: '0xa3a7b6f88361f48403514059f1f16c8e78d60eec',
    helixDaoAddress: '0x3B9E571AdeCB0c277486036D6097E9C2CCcfa9d9',
  },
};

const arbitrumGoerliGoerliConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    issuing: '0x0000000000000000000000000000000000000000',
    backing: '0x4c7708168395aea569453fc36862d2ffcdac588c',
    gatewayAddress: '0x715D99480b77A8d9D603638e593a539E21345FdF',
    helixDaoAddress: '0x3B9E571AdeCB0c277486036D6097E9C2CCcfa9d9',
  },
};

export const ethereumArbitrumL2 = new BridgeBase(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'l1tol2',
});

export const arbitrumGoerliL2 = new BridgeBase(goerliConfig, arbitrumGoerliConfig, arbitrumGoerliGoerliConfig, {
  name: 'ethereum-arbitrum',
  category: 'l1tol2',
});
