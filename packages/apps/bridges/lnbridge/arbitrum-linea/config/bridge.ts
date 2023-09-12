import { arbitrumConfig, lineaConfig } from 'shared/config/network';
import { arbitrumGoerliConfig, lineaGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ArbitrumLineaBridgeConfig } from '../model';

const arbitrumLineaConfig: ArbitrumLineaBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const arbitrumGoerliLineaGoerliConfig: ArbitrumLineaBridgeConfig = {
  contracts: {
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
    issuing: '',
  },
};

export const arbitrumLineaLnBridge = new BridgeBase(arbitrumConfig, lineaConfig, arbitrumLineaConfig, {
  name: 'arbitrum-linea',
  category: 'lnbridgev20-default',
});

export const arbitrumGoerliLineaGoerliLnBridge = new BridgeBase(
  arbitrumGoerliConfig,
  lineaGoerliConfig,
  arbitrumGoerliLineaGoerliConfig,
  {
    name: 'arbitrum-linea',
    category: 'lnbridgev20-default',
  }
);
