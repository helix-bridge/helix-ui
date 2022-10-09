import { avalancheConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { avalanchePolygonConfig } from '../config';

export const avalanchePolygon = new CBridgeBridge(avalancheConfig, polygonConfig, avalanchePolygonConfig, {
  name: 'avalanche-polygon',
  category: 'cBridge',
});
