import { arbitrumConfig, optimismConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ArbitrumOptimismBridgeConfig } from '../model';

const arbitrumOptimismConfig: ArbitrumOptimismBridgeConfig = {
  contracts: {
    backing: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
    issuing: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
  },
};

export const arbitrumOptimism = new BridgeBase(arbitrumConfig, optimismConfig, arbitrumOptimismConfig, {
  name: 'arbitrum-optimism',
  category: 'cBridge',
});
