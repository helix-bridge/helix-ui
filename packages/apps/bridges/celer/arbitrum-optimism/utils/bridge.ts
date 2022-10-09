import { arbitrumConfig, optimismConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { arbitrumOptimismConfig } from '../config';

export const arbitrumOptimism = new CBridgeBridge(arbitrumConfig, optimismConfig, arbitrumOptimismConfig, {
  name: 'arbitrum-optimism',
  category: 'cBridge',
});
