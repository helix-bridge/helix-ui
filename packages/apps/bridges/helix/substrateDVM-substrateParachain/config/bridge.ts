import { pangolinDVMConfig, pangolinParachainConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { SubstrateDVMSubstrateParachainBridgeConfig } from '../model';

const substrateDVMSubstrateParachainConfig: SubstrateDVMSubstrateParachainBridgeConfig = {
  contracts: {
    backing: '0x35A314e53e2fdDfeCA7b743042AaCfB1ABAF0aDe',
    issuing: '',
  },
};

export const pangolinDVMPangolinParachain = new BridgeBase(
  pangolinDVMConfig,
  pangolinParachainConfig,
  substrateDVMSubstrateParachainConfig,
  {
    name: 'substrateDVM-substrateParachain',
    category: 'helix',
  }
);
