import { Bridge, SubstrateDVMBridgeConfig } from '../../model';
import { crabConfig, crabDVMConfig, pangolinConfig } from '../network';
import { pangolinDVMConfig } from '../network/pangolin-dvm';

const crabCrabDVMConfig: SubstrateDVMBridgeConfig = {};

/**
 * smart app: crab
 */
export const crabCrabDVM = new Bridge<SubstrateDVMBridgeConfig>(crabConfig, crabDVMConfig, crabCrabDVMConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'substrate-DVM',
});

const pangolinPangolinDVMConfig: SubstrateDVMBridgeConfig = {};

/**
 * smart app: testnet
 */
export const pangolinPangolinDVM = new Bridge<SubstrateDVMBridgeConfig>(
  pangolinConfig,
  pangolinDVMConfig,
  pangolinPangolinDVMConfig,
  { category: 'helix', activeArrivalConnection: true, name: 'substrate-DVM' }
);
