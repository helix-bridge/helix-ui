import { bscConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { bscPolygonConfig } from '../config';

export const bscPolygon = new CBridgeBridge(bscConfig, polygonConfig, bscPolygonConfig, {
  name: 'bsc-polygon',
  category: 'cBridge',
  issueCompName: 'BSC2Polygon',
  redeemCompName: 'Polygon2BSC',
});
