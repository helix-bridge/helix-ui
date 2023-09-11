import { arbitrumConfig, mantleConfig } from 'shared/config/network';
import { arbitrumGoerliConfig, mantleGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ArbitrumMantleBridgeConfig } from '../model';

const arbitrumMantleConfig: ArbitrumMantleBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const arbitrumGoerliMantleGoerliConfig: ArbitrumMantleBridgeConfig = {
  contracts: {
    backing: '0x504F597CfB0A32704AA6533Fb75dCD60dB982836',
    issuing: '',
  },
};

export const arbitrumMantleLnBridge = new BridgeBase(arbitrumConfig, mantleConfig, arbitrumMantleConfig, {
  name: 'arbitrum-mantle',
  category: 'lnbridgev20-default',
});

export const arbitrumGoerliMantleGoerliLnBridge = new BridgeBase(
  arbitrumGoerliConfig,
  mantleGoerliConfig,
  arbitrumGoerliMantleGoerliConfig,
  {
    name: 'arbitrum-mantle',
    category: 'lnbridgev20-default',
  }
);
