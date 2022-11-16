import { crabDVMConfig, crabParachainConfig, pangolinDVMConfig, pangolinParachainConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { SubstrateDVMSubstrateParachainBridgeConfig } from '../model';

const pangolinDVMPangolinParachainConfig: SubstrateDVMSubstrateParachainBridgeConfig = {
  contracts: {
    backing: '0x35A314e53e2fdDfeCA7b743042AaCfB1ABAF0aDe',
    issuing: '',
  },
};

export const pangolinDVMPangolinParachain = new BridgeBase(
  pangolinDVMConfig,
  pangolinParachainConfig,
  pangolinDVMPangolinParachainConfig,
  {
    name: 'substrateDVM-substrateParachain',
    category: 'helix',
  }
);

const crabDVMCrabParachainConfig: SubstrateDVMSubstrateParachainBridgeConfig = {
  contracts: {
    backing: '0x8c585F9791EE5b4B23fe82888cE576DBB69607eB',
    issuing: '',
  },
};

export const crabDVMCrabParachain = new BridgeBase(crabDVMConfig, crabParachainConfig, crabDVMCrabParachainConfig, {
  name: 'substrateDVM-substrateParachain',
  category: 'helix',
});
