import { mantleConfig, ethereumConfig } from 'shared/config/network';
import { mantleGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { MantleEthereumBridgeConfig } from '../model';

const mantleEthereumConfig: MantleEthereumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const mantleGoerliGoerliConfig: MantleEthereumBridgeConfig = {
  contracts: {
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
    issuing: '',
  },
};

export const mantleEthereumLnBridge = new BridgeBase(mantleConfig, ethereumConfig, mantleEthereumConfig, {
  name: 'mantle-ethereum',
  category: 'lnbridgev20-default',
});

export const mantleGoerliGoerliLnBridge = new BridgeBase(mantleGoerliConfig, goerliConfig, mantleGoerliGoerliConfig, {
  name: 'mantle-ethereum',
  category: 'lnbridgev20-default',
});
