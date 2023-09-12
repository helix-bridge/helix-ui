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
    backing: '0x54cc9716905ba8ebdD01E6364125cA338Cd0054E',
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
