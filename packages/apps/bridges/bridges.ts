import type { BridgeBase } from 'shared/core/bridge';
import { BridgeConfig, ChainConfig } from 'shared/model';
import type { Bridge } from '../core/bridge';
import { CBridgeBridge } from './cbridge/cBridge/utils';
import { CrabDVMDarwiniaDVMBridge, CrabDVMInnerBridge } from './helix/crabDVM-darwiniaDVM/utils';
import { DarwiniaDVMCrabDVMBridge, DarwiniaDVMInnerBridge } from './helix/darwiniaDVM-crabDVM/utils';
import { SubstrateDVMEthereumBridge } from './helix/substrateDVM-ethereum/utils';
import { CrabParachainKaruraBridge } from './xcm/crabParachain-karura/utils';
import { CrabParachainMoonriverBridge } from './xcm/crabParachain-moonriver/utils';
import { KaruraKhalaBridge } from './xcm/karura-khala/utils';
import { KaruraMoonriverBridge } from './xcm/karura-moonriver/utils';
import { KaruraShidenBridge } from './xcm/karura-shiden/utils';
import { KhalaKaruraBridge } from './xcm/khala-karura/utils';
import { KhalaMoonriverBridge } from './xcm/khala-moonriver/utils';
import { KhalaShidenBridge } from './xcm/khala-shiden/utils';
import { MoonriverKaruraBridge } from './xcm/moonriver-karura/utils';
import { MoonriverKhalaBridge } from './xcm/moonriver-khala/utils';
import { MoonriverShidenBridge } from './xcm/moonriver-shiden/utils';
import { ShidenKaruraBridge } from './xcm/shiden-karura/utils';
import { ShidenKhalaBridge } from './xcm/shiden-khala/utils';
import { ShidenMoonriverBridge } from './xcm/shiden-moonriver/utils';
import { CrabDarwiniaBridge } from './helixlp/crab-darwinia/utils';
import { DarwiniaEthereumBridge } from './helixlp/darwinia-ethereum/utils';
import { ArbitrumEthereumBridge } from './helixlp/arbitrum-ethereum/utils';
import { EthereumArbitrumBridgeL2 } from './l1tol2/ethereum-arbitrum/utils';
import { HelixLpBridgeBridge } from './helixlp/helixLpBridge/utils';
import { ArbitrumEthereumBridge as ArbitrumEthereumBridgeLnBridge } from './lnbridge/arbitrum-ethereum/utils';

export const bridgeConstructors = [
  CBridgeBridge,
  HelixLpBridgeBridge,
  CrabDVMDarwiniaDVMBridge,
  CrabDVMInnerBridge,
  CrabParachainKaruraBridge,
  CrabParachainMoonriverBridge,
  DarwiniaDVMCrabDVMBridge,
  DarwiniaDVMInnerBridge,
  KaruraMoonriverBridge,
  KaruraShidenBridge,
  KaruraKhalaBridge,
  KhalaKaruraBridge,
  KhalaMoonriverBridge,
  KhalaShidenBridge,
  MoonriverShidenBridge,
  MoonriverKaruraBridge,
  MoonriverKhalaBridge,
  ShidenKaruraBridge,
  ShidenKhalaBridge,
  ShidenMoonriverBridge,
  SubstrateDVMEthereumBridge,
  CrabDarwiniaBridge,
  DarwiniaEthereumBridge,
  ArbitrumEthereumBridge,
  EthereumArbitrumBridgeL2,
  ArbitrumEthereumBridgeLnBridge,
];

export function bridgeFactory<C extends BridgeConfig, O extends ChainConfig, T extends ChainConfig>(
  config: BridgeBase
): Bridge<C, O, T> {
  const Constructor = bridgeConstructors.find((item) => {
    return item.alias === config.subClsName;
  })!;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Constructor(config.departure, config.arrival, config.config, config.options);
}
