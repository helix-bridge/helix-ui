import { arbitrumConfig, ethereumConfig } from 'shared/config/network';
import { zksyncGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { EthereumZksyncBridgeConfig } from '../model';

const ethereumArbitrumConfig: EthereumZksyncBridgeConfig = {
  contracts: {
    backing: '0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978',
    issuing: '0xeAb1F01a8f4A2687023B159c2063639Adad5304E',
  },
};

const goerliZksyncGoerliConfig: EthereumZksyncBridgeConfig = {
  contracts: {
    backing: '0xc05ca63DAB6b48bcd82320d29Ad44BD6A3C21160',
    issuing: '0xe0be4a2b4B0846fB088F720D3D0DFE725b9c91ee',
  },
};

export const ethereumArbitrumLnBridge = new BridgeBase(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'lnbridgev20-default',
});

export const goerliZksyncGoerliLnBridge = new BridgeBase(goerliConfig, zksyncGoerliConfig, goerliZksyncGoerliConfig, {
  name: 'ethereum-zksync',
  category: 'lnbridgev20-default',
});
