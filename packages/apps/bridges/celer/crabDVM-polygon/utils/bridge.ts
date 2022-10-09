import { crabDVMConfig, polygonConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { crabDVMPolygonConfig } from '../config';

export const crabDVMPolygon = new CBridgeBridge(crabDVMConfig, polygonConfig, crabDVMPolygonConfig, {
  name: 'crabDVM-polygon',
  category: 'cBridge',
});
