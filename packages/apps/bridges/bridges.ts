import type { BridgeBase } from 'shared/core/bridge';
import { BridgeConfig, ChainConfig } from 'shared/model';
import type { Bridge } from '../core/bridge';
import { CBridgeBridge } from './celer/cBridge/utils';
import { SubstrateDVMBridge } from './helix/substrate-dvm/utils';
import { SubstrateSubstrateDVMBridge } from './helix/substrate-substrateDVM/utils';
import { SubstrateSubstrateParachainBridge } from './helix/substrate-substrateParachain/utils';
import { SubstrateDVMEthereumBridge } from './helix/substrateDVM-ethereum/utils';
import { SubstrateDVMSubstrateDVMBridge, SubstrateDVMInnerBridge } from './helix/substrateDVM-substrateDVM/utils';
import { CrabParachainKaruraBridge } from './xcm/crabParachain-karura/utils';
import { CrabParachainMoonriverBridge } from './xcm/crabParachain-moonriver/utils';

export const bridgeConstructors = [
  CBridgeBridge,
  CrabParachainKaruraBridge,
  CrabParachainMoonriverBridge,
  SubstrateDVMBridge,
  SubstrateDVMEthereumBridge,
  SubstrateDVMSubstrateDVMBridge,
  SubstrateDVMInnerBridge,
  SubstrateSubstrateDVMBridge,
  SubstrateSubstrateParachainBridge,
];

export function bridgeFactory<C extends BridgeConfig, O extends ChainConfig, T extends ChainConfig>(
  config: BridgeBase
): Bridge<C, O, T> {
  const Constructor = bridgeConstructors.find((item) => item.alias === config.subClsName)!;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Constructor(config.departure, config.arrival, config.config, config.options);
}
