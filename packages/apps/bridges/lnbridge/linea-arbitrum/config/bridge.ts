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
    backing: '0xE4B4b7707450b60421b5d7DE372fA5920F2bBDa8',
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
