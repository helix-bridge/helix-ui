import { astarConfig, crabDVMConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { crabDVMAstarConfig } from '../config';

export const crabDVMAstar = new CBridgeBridge(crabDVMConfig, astarConfig, crabDVMAstarConfig, {
  name: 'crabDVM-astar',
  category: 'cBridge',
});
