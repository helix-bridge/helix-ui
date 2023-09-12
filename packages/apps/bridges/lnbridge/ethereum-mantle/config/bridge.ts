import { mantleConfig, ethereumConfig, mantleGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { EthereumMantleBridgeConfig } from '../model';

const ethereumMantleConfig: EthereumMantleBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const goerliMantleGoerliConfig: EthereumMantleBridgeConfig = {
  contracts: {
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
    issuing: '',
  },
};

export const ethereumMantleLnBridge = new BridgeBase(ethereumConfig, mantleConfig, ethereumMantleConfig, {
  name: 'ethereum-mantle',
  category: 'lnbridgev20-default',
});

export const goerliMantleGoerliLnBridge = new BridgeBase(goerliConfig, mantleGoerliConfig, goerliMantleGoerliConfig, {
  name: 'ethereum-mantle',
  category: 'lnbridgev20-default',
});
