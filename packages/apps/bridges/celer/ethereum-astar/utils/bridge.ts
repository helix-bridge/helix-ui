import { astarConfig, ethereumConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { ethereumAstarConfig } from '../config';

export const ethereumAstar = new CBridgeBridge(ethereumConfig, astarConfig, ethereumAstarConfig, {
  name: 'ethereum-astar',
  category: 'cBridge',
});
