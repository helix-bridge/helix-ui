import { astarConfig, optimismConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { astarOptimismConfig } from '../config';

export const astarOptimism = new CBridgeBridge(astarConfig, optimismConfig, astarOptimismConfig, {
  name: 'astar-optimism',
  category: 'cBridge',
});
