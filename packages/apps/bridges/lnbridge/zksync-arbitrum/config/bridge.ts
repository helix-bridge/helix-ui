import { zksyncConfig, arbitrumConfig, zksyncGoerliConfig, arbitrumGoerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ZksyncArbitrumBridgeConfig } from '../model';

const zksyncArbitrumConfig: ZksyncArbitrumBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

const zksyncGoerliArbitrumGoerliConfig: ZksyncArbitrumBridgeConfig = {
  contracts: {
    backing: '0xa88b0119753A0dC9cB27e54Ab9F333DAd80D6141',
    issuing: '',
  },
};

export const zksyncArbitrumLnBridge = new BridgeBase(zksyncConfig, arbitrumConfig, zksyncArbitrumConfig, {
  name: 'zksync-arbitrum',
  category: 'lnbridgev20-default',
});

export const zksyncGoerliArbitrumGoerliLnBridge = new BridgeBase(
  zksyncGoerliConfig,
  arbitrumGoerliConfig,
  zksyncGoerliArbitrumGoerliConfig,
  {
    name: 'zksync-arbitrum',
    category: 'lnbridgev20-default',
  }
);
