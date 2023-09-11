import { mantleConfig, lineaConfig } from 'shared/config/network';
import { mantleGoerliConfig, lineaGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { MantleLineaBridgeConfig } from '../model';

const mantleLineaConfig: MantleLineaBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const mantleGoerliLineaGoerliConfig: MantleLineaBridgeConfig = {
  contracts: {
    backing: '0x79e6f452f1e491a7aF0382FA0a6EF9368691960D',
    issuing: '',
  },
};

export const mantleLineaLnBridge = new BridgeBase(mantleConfig, lineaConfig, mantleLineaConfig, {
  name: 'mantle-linea',
  category: 'lnbridgev20-default',
});

export const mantleGoerliLineaGoerliLnBridge = new BridgeBase(
  mantleGoerliConfig,
  lineaGoerliConfig,
  mantleGoerliLineaGoerliConfig,
  {
    name: 'mantle-linea',
    category: 'lnbridgev20-default',
  }
);
