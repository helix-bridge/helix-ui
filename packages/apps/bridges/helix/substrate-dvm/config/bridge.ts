import { crabConfig, crabDVMConfig, darwiniaConfig, darwiniaDVMConfig, pangolinConfig } from 'shared/config/network';
import { pangolinDVMConfig } from 'shared/config/network/pangolin-dvm';
import { BridgeBase } from 'shared/core/bridge';
import { SubstrateDVMBridgeConfig } from '../model';

const crabCrabDVMConfig: SubstrateDVMBridgeConfig = {};

export const crabCrabDVM = new BridgeBase<SubstrateDVMBridgeConfig>(crabConfig, crabDVMConfig, crabCrabDVMConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'substrate-DVM',
});

const darwiniaDarwiniaDVMConfig: SubstrateDVMBridgeConfig = {};

export const darwiniaDarwiniaDVM = new BridgeBase<SubstrateDVMBridgeConfig>(
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

export const pangolinPangolinDVM = new BridgeBase<SubstrateDVMBridgeConfig>(
  pangolinConfig,
  pangolinDVMConfig,
  pangolinPangolinDVMConfig,
  { category: 'helix', activeArrivalConnection: true, name: 'substrate-DVM' }
);
