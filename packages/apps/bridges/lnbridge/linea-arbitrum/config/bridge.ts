import { lineaConfig, arbitrumConfig, lineaGoerliConfig, arbitrumGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { LineaArbitrumBridgeConfig } from '../model';

const lineaArbitrumConfig: LineaArbitrumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const lineaGoerliArbitrumGoerliConfig: LineaArbitrumBridgeConfig = {
  contracts: {
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
    issuing: '',
  },
};

export const lineaArbitrumLnBridge = new BridgeBase(lineaConfig, arbitrumConfig, lineaArbitrumConfig, {
  name: 'linea-arbitrum',
  category: 'lnbridgev20-default',
});

export const lineaGoerliArbitrumGoerliLnBridge = new BridgeBase(
  lineaGoerliConfig,
  arbitrumGoerliConfig,
  lineaGoerliArbitrumGoerliConfig,
  {
    name: 'linea-arbitrum',
    category: 'lnbridgev20-default',
  }
);
