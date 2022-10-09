import { CHAIN_TYPE } from 'shared/config/env';
import { arbitrumAstar } from '../bridges/celer/arbitrum-astar/utils/bridge';
import { arbitrumAvalanche } from '../bridges/celer/arbitrum-avalanche/utils/bridge';
import { arbitrumOptimism } from '../bridges/celer/arbitrum-optimism/utils/bridge';
import { arbitrumPolygon } from '../bridges/celer/arbitrum-polygon/utils/bridge';
import { astarAvalanche } from '../bridges/celer/astar-avalanche/utils/bridge';
import { astarOptimism } from '../bridges/celer/astar-optimism/utils/bridge';
import { avalancheOptimism } from '../bridges/celer/avalanche-optimism/utils/bridge';
import { avalanchePolygon } from '../bridges/celer/avalanche-polygon/utils/bridge';
import { bscArbitrum } from '../bridges/celer/bsc-arbitrum/utils/bridge';
import { bscAstar } from '../bridges/celer/bsc-astar/utils/bridge';
import { bscAvalanche } from '../bridges/celer/bsc-avalanche/utils/bridge';
import { bscOptimism } from '../bridges/celer/bsc-optimism/utils/bridge';
import { bscPolygon } from '../bridges/celer/bsc-polygon/utils/bridge';
import { crabDVMAstar } from '../bridges/celer/crabDVM-astar/utils/bridge';
import { crabDVMEthereum } from '../bridges/celer/crabDVM-ethereum/utils/bridge';
import { crabDVMHeco } from '../bridges/celer/crabDVM-heco/utils/bridge';
import { crabDVMPolygon } from '../bridges/celer/crabDVM-polygon/utils/bridge';
import { ethereumArbitrum } from '../bridges/celer/ethereum-arbitrum/utils/bridge';
import { ethereumAstar } from '../bridges/celer/ethereum-astar/utils/bridge';
import { ethereumAvalanche } from '../bridges/celer/ethereum-avalanche/utils/bridge';
import { ethereumBSC } from '../bridges/celer/ethereum-bsc/utils/bridge';
import { ethereumHeco } from '../bridges/celer/ethereum-heco/utils/bridge';
import { ethereumOptimism } from '../bridges/celer/ethereum-optimism/utils/bridge';
import { ethereumPolygon } from '../bridges/celer/ethereum-polygon/utils/bridge';
import { hecoPolygon } from '../bridges/celer/heco-polygon/utils/bridge';
import { polygonAstar } from '../bridges/celer/polygon-astar/utils/bridge';
import { polygonOptimism } from '../bridges/celer/polygon-optimism/utils/bridge';
import { crabCrabDVM, darwiniaDarwiniaDVM, pangolinPangolinDVM } from '../bridges/helix/substrate-dvm/utils/bridge';
import { darwiniaCrabDVM, pangoroPangolinDVM } from '../bridges/helix/substrate-substrateDVM/utils/bridge';
import {
  crabCrabParachain,
  pangolinPangolinParachain,
} from '../bridges/helix/substrate-substrateParachain/utils/bridge';
import { pangoroDVMGoerli } from '../bridges/helix/substrateDVM-ethereum/utils/bridge';
import { darwiniaDVMCrabDVM, pangoroDVMPangolinDVM } from '../bridges/helix/substrateDVM-substrateDVM/utils/bridge';
import {
  darwiniaDVMDarwiniaDVM,
  pangoroDVMPangoroDVM,
} from '../bridges/helix/substrateDVM-substrateDVM/utils/bridge-inner';
import { crabParachainKarura } from '../bridges/xcm/crabParachain-karura/utils/bridge';
import { crabParachainMoonriver } from '../bridges/xcm/crabParachain-moonriver/utils/bridge';

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
