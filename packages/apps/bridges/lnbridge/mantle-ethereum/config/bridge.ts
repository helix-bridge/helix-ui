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
    backing: '0x79e6f452f1e491a7aF0382FA0a6EF9368691960D',
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
