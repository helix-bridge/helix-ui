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
    backing: '0x504F597CfB0A32704AA6533Fb75dCD60dB982836',
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
