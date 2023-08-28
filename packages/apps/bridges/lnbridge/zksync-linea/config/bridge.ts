import { zksyncConfig, lineaConfig, zksyncGoerliConfig, lineaGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ZksyncLineaBridgeConfig } from '../model';

const zksyncLineaConfig: ZksyncLineaBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const zksyncGoerliLineaGoerliConfig: ZksyncLineaBridgeConfig = {
  contracts: {
    backing: '0xAe753Ae021cf1Eb3ec55C5c8798C9015Acde6281',
    issuing: '',
  },
};

export const zksyncLineaLnBridge = new BridgeBase(zksyncConfig, lineaConfig, zksyncLineaConfig, {
  name: 'zksync-linea',
  category: 'lnbridgev20-default',
});

export const zksyncGoerliLineaGoerliLnBridge = new BridgeBase(
  zksyncGoerliConfig,
  lineaGoerliConfig,
  zksyncGoerliLineaGoerliConfig,
  {
    name: 'zksync-linea',
    category: 'lnbridgev20-default',
  }
);
