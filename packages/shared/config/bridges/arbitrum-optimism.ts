import { arbitrumConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { ArbitrumOptimismBridgeConfig } from 'shared/model';

const arbitrumOptimismConfig: ArbitrumOptimismBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const arbitrumOptimism = new Bridge(arbitrumConfig, optimismConfig, arbitrumOptimismConfig, {
  name: 'arbitrum-optimism',
  category: 'cBridge',
});
