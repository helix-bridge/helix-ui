import { arbitrumConfig, zksyncConfig } from 'shared/config/network';
import { arbitrumGoerliConfig, zksyncGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ArbitrumZksyncBridgeConfig } from '../model';

const arbitrumZksyncConfig: ArbitrumZksyncBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const arbitrumGoerliZksyncGoerliConfig: ArbitrumZksyncBridgeConfig = {
  contracts: {
    backing: '0xCAb1f69C671f1548fd3dE5d63852E9B9181a0D0E',
    issuing: '',
  },
};

export const arbitrumZksyncLnBridge = new BridgeBase(arbitrumConfig, zksyncConfig, arbitrumZksyncConfig, {
  name: 'arbitrum-zksync',
  category: 'lnbridgev20-default',
});

export const arbitrumGoerliZksyncGoerliLnBridge = new BridgeBase(
  arbitrumGoerliConfig,
  zksyncGoerliConfig,
  arbitrumGoerliZksyncGoerliConfig,
  {
    name: 'arbitrum-zksync',
    category: 'lnbridgev20-default',
  }
);
