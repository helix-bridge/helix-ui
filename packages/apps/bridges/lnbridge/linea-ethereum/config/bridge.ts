import { lineaConfig, ethereumConfig, lineaGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { LineaEthereumBridgeConfig } from '../model';

const lineaEthereumConfig: LineaEthereumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const lineaGoerliGoerliConfig: LineaEthereumBridgeConfig = {
  contracts: {
    backing: '0x79e6f452f1e491a7aF0382FA0a6EF9368691960D',
    issuing: '',
  },
};

export const lineaEthereumLnBridge = new BridgeBase(lineaConfig, ethereumConfig, lineaEthereumConfig, {
  name: 'linea-ethereum',
  category: 'lnbridgev20-opposite',
});

export const lineaGoerliGoerliLnBridge = new BridgeBase(lineaGoerliConfig, goerliConfig, lineaGoerliGoerliConfig, {
  name: 'linea-ethereum',
  category: 'lnbridgev20-opposite',
});
