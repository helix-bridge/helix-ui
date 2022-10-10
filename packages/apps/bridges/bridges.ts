import { CHAIN_TYPE } from 'shared/config/env';
import { arbitrumAstar } from './celer/arbitrum-astar/utils/bridge';
import { arbitrumAvalanche } from './celer/arbitrum-avalanche/utils/bridge';
import { arbitrumOptimism } from './celer/arbitrum-optimism/utils/bridge';
import { arbitrumPolygon } from './celer/arbitrum-polygon/utils/bridge';
import { astarAvalanche } from './celer/astar-avalanche/utils/bridge';
import { astarOptimism } from './celer/astar-optimism/utils/bridge';
import { avalancheOptimism } from './celer/avalanche-optimism/utils/bridge';
import { avalanchePolygon } from './celer/avalanche-polygon/utils/bridge';
import { bscArbitrum } from './celer/bsc-arbitrum/utils/bridge';
import { bscAstar } from './celer/bsc-astar/utils/bridge';
import { bscAvalanche } from './celer/bsc-avalanche/utils/bridge';
import { bscOptimism } from './celer/bsc-optimism/utils/bridge';
import { bscPolygon } from './celer/bsc-polygon/utils/bridge';
import { crabDVMAstar } from './celer/crabDVM-astar/utils/bridge';
import { crabDVMEthereum } from './celer/crabDVM-ethereum/utils/bridge';
import { crabDVMHeco } from './celer/crabDVM-heco/utils/bridge';
import { crabDVMPolygon } from './celer/crabDVM-polygon/utils/bridge';
import { ethereumArbitrum } from './celer/ethereum-arbitrum/utils/bridge';
import { ethereumAstar } from './celer/ethereum-astar/utils/bridge';
import { ethereumAvalanche } from './celer/ethereum-avalanche/utils/bridge';
import { ethereumBSC } from './celer/ethereum-bsc/utils/bridge';
import { ethereumHeco } from './celer/ethereum-heco/utils/bridge';
import { ethereumOptimism } from './celer/ethereum-optimism/utils/bridge';
import { ethereumPolygon } from './celer/ethereum-polygon/utils/bridge';
import { hecoPolygon } from './celer/heco-polygon/utils/bridge';
import { polygonAstar } from './celer/polygon-astar/utils/bridge';
import { polygonOptimism } from './celer/polygon-optimism/utils/bridge';
import { crabCrabDVM, darwiniaDarwiniaDVM, pangolinPangolinDVM } from './helix/substrate-dvm/utils/bridge';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './helix/substrate-substrateDVM/utils/bridge';
import { crabCrabParachain, pangolinPangolinParachain } from './helix/substrate-substrateParachain/utils/bridge';
import { pangoroDVMGoerli, darwiniaDVMEthereum } from './helix/substrateDVM-ethereum/utils/bridge';
import { darwiniaDVMCrabDVM, pangoroDVMPangolinDVM } from './helix/substrateDVM-substrateDVM/utils/bridge';
import { darwiniaDVMDarwiniaDVM, pangoroDVMPangoroDVM } from './helix/substrateDVM-substrateDVM/utils/bridge-inner';
import { crabParachainKarura } from './xcm/crabParachain-karura/utils/bridge';
import { crabParachainMoonriver } from './xcm/crabParachain-moonriver/utils/bridge';

const formalBridges = [
  arbitrumAstar,
  arbitrumAvalanche,
  arbitrumOptimism,
  astarAvalanche,
  astarOptimism,
  avalancheOptimism,
  bscArbitrum,
  bscAstar,
  bscAvalanche,
  bscOptimism,
  crabCrabDVM,
  crabDVMEthereum,
  crabDVMHeco,
  crabDVMPolygon,
  darwiniaDarwiniaDVM,
  darwiniaCrabDVM,
  darwiniaDVMCrabDVM,
  darwiniaDVMDarwiniaDVM,
  darwiniaDVMEthereum,
  ethereumHeco,
  ethereumPolygon,
  hecoPolygon,
  crabCrabParachain,
  polygonAstar,
  ethereumAstar,
  ethereumBSC,
  ethereumAvalanche,
  ethereumArbitrum,
  ethereumOptimism,
  bscPolygon,
  avalanchePolygon,
  arbitrumPolygon,
  polygonOptimism,
  crabDVMAstar,
  crabParachainKarura,
  crabParachainMoonriver,
];

const testBridges = [
  pangolinPangolinDVM,
  pangoroDVMPangolinDVM,
  pangoroPangolinDVM,
  pangolinPangolinParachain,
  pangoroDVMGoerli,
  pangoroDVMPangoroDVM,
];

export const BRIDGES = (() => {
  switch (CHAIN_TYPE) {
    case 'all':
      return [...formalBridges, ...testBridges];
    case 'formal':
      return formalBridges;
    case 'test':
      return testBridges;
    default:
      return [];
  }
})();
