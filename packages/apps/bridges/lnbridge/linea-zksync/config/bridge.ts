import { lineaConfig, zksyncConfig, lineaGoerliConfig, zksyncGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { LineaZksyncBridgeConfig } from '../model';

const lineaZksyncConfig: LineaZksyncBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const lineaGoerliZksyncGoerliConfig: LineaZksyncBridgeConfig = {
  contracts: {
    backing: '0xA4A380B592ceC969bD43BA54F8833d88b8b24811',
    issuing: '',
  },
};

export const lineaZksyncLnBridge = new BridgeBase(lineaConfig, zksyncConfig, lineaZksyncConfig, {
  name: 'linea-zksync',
  category: 'lnbridgev20-default',
});

export const lineaGoerliZksyncGoerliLnBridge = new BridgeBase(
  lineaGoerliConfig,
  zksyncGoerliConfig,
  lineaGoerliZksyncGoerliConfig,
  {
    name: 'linea-zksync',
    category: 'lnbridgev20-default',
  }
);
