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
    backing: '0x5A351EA4F4128F58EA13DDa52E3d1842c0b3B690',
    issuing: '0xeA5f0a09A8723444965FDd6f76523C338faB00f7',
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
