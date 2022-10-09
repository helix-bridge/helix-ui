import { avalancheConfig, optimismConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { avalancheOptimismConfig } from '../config';

export const avalancheOptimism = new CBridgeBridge(avalancheConfig, optimismConfig, avalancheOptimismConfig, {
  name: 'avalanche-optimism',
  category: 'cBridge',
});
