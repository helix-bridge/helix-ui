import { arbitrumConfig, ethereumConfig } from 'shared/config/network';
import { arbitrumGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { EthereumArbitrumBridgeConfig } from '../model';

const ethereumArbitrumConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    backing: '0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978',
    issuing: '0xeAb1F01a8f4A2687023B159c2063639Adad5304E',
  },
};

const goerliArbitrumGoerliConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
    issuing: '',
  },
};

export const ethereumArbitrumLnBridge = new BridgeBase(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'lnbridgev20-default',
});

export const goerliArbitrumLnBridge = new BridgeBase(goerliConfig, arbitrumGoerliConfig, goerliArbitrumGoerliConfig, {
  name: 'ethereum-arbitrum',
  category: 'lnbridgev20-default',
});
