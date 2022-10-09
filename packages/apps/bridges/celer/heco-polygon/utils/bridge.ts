import { hecoConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { hecoPolygonConfig } from '../config';

export const hecoPolygon = new CBridgeBridge(hecoConfig, polygonConfig, hecoPolygonConfig, {
  name: 'heco-polygon',
  category: 'cBridge',
  disableIssue: true,
  disableRedeem: true,
});
