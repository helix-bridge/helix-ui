import { ethereumConfig, optimismConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { ethereumOptimismConfig } from '../config';

export const ethereumOptimism = new CBridgeBridge(ethereumConfig, optimismConfig, ethereumOptimismConfig, {
  name: 'ethereum-optimism',
  category: 'cBridge',
});
