import { ethereumConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { ethereumPolygonConfig } from '../config';

export const ethereumPolygon = new CBridgeBridge(ethereumConfig, polygonConfig, ethereumPolygonConfig, {
  name: 'ethereum-polygon',
  category: 'cBridge',
});
