import { Bridge, SubstrateDVMBridgeConfig } from '../../model';
import { crabConfig, crabDVMConfig, darwiniaConfig, darwiniaDVMConfig, pangolinConfig } from '../network';
import { pangolinDVMConfig } from '../network/pangolin-dvm';

const crabCrabDVMConfig: SubstrateDVMBridgeConfig = {};

export const crabCrabDVM = new Bridge<SubstrateDVMBridgeConfig>(crabConfig, crabDVMConfig, crabCrabDVMConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'substrate-DVM',
});

const darwiniaDarwiniaDVMConfig: SubstrateDVMBridgeConfig = {};

export const darwiniaDarwiniaDVM = new Bridge<SubstrateDVMBridgeConfig>(
  darwiniaConfig,
  darwiniaDVMConfig,
  darwiniaDarwiniaDVMConfig,
  {
    category: 'helix',
    activeArrivalConnection: true,
    name: 'substrate-DVM',
  }
);

const pangolinPangolinDVMConfig: SubstrateDVMBridgeConfig = {};

export const pangolinPangolinDVM = new Bridge<SubstrateDVMBridgeConfig>(
  pangolinConfig,
  pangolinDVMConfig,
  pangolinPangolinDVMConfig,
  { category: 'helix', activeArrivalConnection: true, name: 'substrate-DVM' }
);
