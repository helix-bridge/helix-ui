import { optimismConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { polygonOptimismConfig } from '../config';

export const polygonOptimism = new CBridgeBridge(polygonConfig, optimismConfig, polygonOptimismConfig, {
  name: 'polygon-optimism',
  category: 'cBridge',
});
