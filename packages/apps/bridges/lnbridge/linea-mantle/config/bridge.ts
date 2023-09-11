import { lineaConfig, mantleConfig, lineaGoerliConfig, mantleGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { LineaMantleBridgeConfig } from '../model';

const lineaMantleConfig: LineaMantleBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const lineaGoerliMantleGoerliConfig: LineaMantleBridgeConfig = {
  contracts: {
    backing: '0xE4B4b7707450b60421b5d7DE372fA5920F2bBDa8',
    issuing: '',
  },
};

export const lineaMantleLnBridge = new BridgeBase(lineaConfig, mantleConfig, lineaMantleConfig, {
  name: 'linea-mantle',
  category: 'lnbridgev20-default',
});

export const lineaGoerliMantleGoerliLnBridge = new BridgeBase(
  lineaGoerliConfig,
  mantleGoerliConfig,
  lineaGoerliMantleGoerliConfig,
  {
    name: 'linea-mantle',
    category: 'lnbridgev20-default',
  }
);
