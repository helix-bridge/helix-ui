import { arbitrumConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { arbitrumPolygonConfig } from '../config';

export const arbitrumPolygon = new CBridgeBridge(arbitrumConfig, polygonConfig, arbitrumPolygonConfig, {
  name: 'arbitrum-polygon',
  category: 'cBridge',
});
