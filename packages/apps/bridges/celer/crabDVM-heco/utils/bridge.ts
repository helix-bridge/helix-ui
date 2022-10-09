import { crabDVMConfig, hecoConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { crabDVMHecoConfig } from '../config';

export const crabDVMHeco = new CBridgeBridge(crabDVMConfig, hecoConfig, crabDVMHecoConfig, {
  name: 'crabDVM-heco',
  category: 'cBridge',
});
