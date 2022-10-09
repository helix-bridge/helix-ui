import { astarConfig, bscConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { bscAstarConfig } from '../config';

export const bscAstar = new CBridgeBridge(bscConfig, astarConfig, bscAstarConfig, {
  name: 'bsc-astar',
  category: 'cBridge',
});
