import { mantleConfig, arbitrumConfig } from 'shared/config/network';
import { mantleGoerliConfig, arbitrumGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { MantleArbitrumBridgeConfig } from '../model';

const mantleArbitrumConfig: MantleArbitrumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const mantleGoerliArbitrumGoerliConfig: MantleArbitrumBridgeConfig = {
  contracts: {
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
    issuing: '',
  },
};

export const mantleArbitrumLnBridge = new BridgeBase(mantleConfig, arbitrumConfig, mantleArbitrumConfig, {
  name: 'mantle-arbitrum',
  category: 'lnbridgev20-default',
});

export const mantleGoerliArbitrumGoerliLnBridge = new BridgeBase(
  mantleGoerliConfig,
  arbitrumGoerliConfig,
  mantleGoerliArbitrumGoerliConfig,
  {
    name: 'mantle-arbitrum',
    category: 'lnbridgev20-default',
  }
);
