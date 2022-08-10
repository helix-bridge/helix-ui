import { ethereumConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumOptimismBridgeConfig } from 'shared/model';

const ethereumOptimismConfig: EthereumOptimismBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const ethereumOptimism = new Bridge(ethereumConfig, optimismConfig, ethereumOptimismConfig, {
  name: 'ethereum-optimism',
  category: 'cBridge',
});
