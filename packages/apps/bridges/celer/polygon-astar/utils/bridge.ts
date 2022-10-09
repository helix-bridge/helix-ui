import { astarConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { polygonAstarConfig } from '../config';

export const polygonAstar = new CBridgeBridge(polygonConfig, astarConfig, polygonAstarConfig, {
  name: 'polygon-astar',
  category: 'cBridge',
});
