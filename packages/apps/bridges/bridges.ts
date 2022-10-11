import { CBridgeBridge } from './celer/cBridge/utils';
import { SubstrateDVMBridge } from './helix/substrate-dvm/utils';
import { SubstrateSubstrateDVMBridge } from './helix/substrate-substrateDVM/utils';
import { SubstrateSubstrateParachainBridge } from './helix/substrate-substrateParachain/utils';
import { SubstrateDVMEthereumBridge } from './helix/substrateDVM-ethereum/utils';
import {
  SubstrateDVMSubstrateDVMBridge,
  SubstrateDVMSubstrateDVMBridgeInner,
} from './helix/substrateDVM-substrateDVM/utils';
import { CrabParachainKaruraBridge } from './xcm/crabParachain-karura/utils';
import { CrabParachainMoonriverBridge } from './xcm/crabParachain-moonriver/utils';

export const bridgeConstructors = [
  CBridgeBridge,
  CrabParachainKaruraBridge,
  CrabParachainMoonriverBridge,
  SubstrateDVMBridge,
  SubstrateDVMEthereumBridge,
  SubstrateDVMSubstrateDVMBridge,
  SubstrateDVMSubstrateDVMBridgeInner,
  SubstrateSubstrateDVMBridge,
  SubstrateSubstrateParachainBridge,
];
