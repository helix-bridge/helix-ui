import { lineaConfig, ethereumConfig, lineaGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { EthereumLineaBridgeConfig } from '../model';

const ethereumLineaConfig: EthereumLineaBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const goerliLineaGoerliConfig: EthereumLineaBridgeConfig = {
  contracts: {
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
    issuing: '',
  },
};

export const ethereumLineaLnBridge = new BridgeBase(ethereumConfig, lineaConfig, ethereumLineaConfig, {
  name: 'ethereum-linea',
  category: 'lnbridgev20-default',
});

export const goerliLineaGoerliLnBridge = new BridgeBase(goerliConfig, lineaGoerliConfig, goerliLineaGoerliConfig, {
  name: 'ethereum-linea',
  category: 'lnbridgev20-default',
});
