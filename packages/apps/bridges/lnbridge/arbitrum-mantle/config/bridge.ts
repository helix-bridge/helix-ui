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
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
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
