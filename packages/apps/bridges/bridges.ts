import type { BridgeBase } from 'shared/core/bridge';
import { BridgeConfig, ChainConfig } from 'shared/model';
import type { Bridge } from '../core/bridge';
import { CBridgeBridge } from './cbridge/cBridge/utils';
import { SubstrateDVMBridge } from './helix/substrate-dvm/utils';
import { SubstrateSubstrateDVMBridge } from './helix/substrate-substrateDVM/utils';
import { SubstrateSubstrateParachainBridge } from './helix/substrate-substrateParachain/utils';
import { SubstrateDVMEthereumBridge } from './helix/substrateDVM-ethereum/utils';
import { DarwiniaDVMCrabDVMBridge, DarwiniaDVMInnerBridge } from './helix/darwiniaDVM-crabDVM/utils';
import { CrabDVMDarwiniaDVMBridge, CrabDVMInnerBridge } from './helix/crabDVM-darwiniaDVM/utils';
import { CrabParachainKaruraBridge } from './xcm/crabParachain-karura/utils';
import { CrabParachainMoonriverBridge } from './xcm/crabParachain-moonriver/utils';
import { SubstrateDVMSubstrateParachainBridge } from './helix/substrateDVM-substrateParachain/utils';

export const bridgeConstructors = [
  CBridgeBridge,
  CrabParachainKaruraBridge,
  CrabParachainMoonriverBridge,
  SubstrateDVMBridge,
  SubstrateDVMEthereumBridge,
  CrabDVMDarwiniaDVMBridge,
  CrabDVMInnerBridge,
  DarwiniaDVMCrabDVMBridge,
  DarwiniaDVMInnerBridge,
  SubstrateSubstrateDVMBridge,
  SubstrateSubstrateParachainBridge,
  SubstrateDVMSubstrateParachainBridge,
];

export function bridgeFactory<C extends BridgeConfig, O extends ChainConfig, T extends ChainConfig>(
  config: BridgeBase
): Bridge<C, O, T> {
  const Constructor = bridgeConstructors.find((item) => item.alias === config.subClsName)!;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Constructor(config.departure, config.arrival, config.config, config.options);
}
