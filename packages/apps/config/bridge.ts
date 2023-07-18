import { CHAIN_TYPE } from 'shared/config/env';
import { arbitrumAstar } from '../bridges/cbridge/arbitrum-astar/config';
import { arbitrumAvalanche } from '../bridges/cbridge/arbitrum-avalanche/config';
import { arbitrumOptimism } from '../bridges/cbridge/arbitrum-optimism/config';
import { arbitrumPolygon } from '../bridges/cbridge/arbitrum-polygon/config';
import { astarAvalanche } from '../bridges/cbridge/astar-avalanche/config';
import { astarOptimism } from '../bridges/cbridge/astar-optimism/config';
import { avalancheOptimism } from '../bridges/cbridge/avalanche-optimism/config';
import { avalanchePolygon } from '../bridges/cbridge/avalanche-polygon/config';
import { bscArbitrum } from '../bridges/cbridge/bsc-arbitrum/config';
import { bscAstar } from '../bridges/cbridge/bsc-astar/config';
import { bscAvalanche } from '../bridges/cbridge/bsc-avalanche/config';
import { bscOptimism } from '../bridges/cbridge/bsc-optimism/config';
import { bscPolygon } from '../bridges/cbridge/bsc-polygon/config';
import { crabDVMAstar } from '../bridges/cbridge/crabDVM-astar/config';
import { crabDVMEthereum } from '../bridges/cbridge/crabDVM-ethereum/config';
import { crabDVMHeco } from '../bridges/cbridge/crabDVM-heco/config';
import { crabDVMPolygon } from '../bridges/cbridge/crabDVM-polygon/config';
import { ethereumArbitrum } from '../bridges/cbridge/ethereum-arbitrum/config';
import { ethereumAstar } from '../bridges/cbridge/ethereum-astar/config';
import { ethereumAvalanche } from '../bridges/cbridge/ethereum-avalanche/config';
import { ethereumBSC } from '../bridges/cbridge/ethereum-bsc/config';
import { ethereumHeco } from '../bridges/cbridge/ethereum-heco/config';
import { ethereumOptimism } from '../bridges/cbridge/ethereum-optimism/config';
import { ethereumPolygon } from '../bridges/cbridge/ethereum-polygon/config';
import { hecoPolygon } from '../bridges/cbridge/heco-polygon/config';
import { polygonAstar } from '../bridges/cbridge/polygon-astar/config';
import { polygonOptimism } from '../bridges/cbridge/polygon-optimism/config';
import { crabDVMcrabDVM, crabDVMDarwiniaDVM } from '../bridges/helix/crabDVM-darwiniaDVM/config/bridge';
import {
  darwiniaDVMCrabDVM,
  darwiniaDVMDarwiniaDVM,
  pangoroDVMPangolinDVM,
  pangoroDVMPangoroDVM,
} from '../bridges/helix/darwiniaDVM-crabDVM/config/bridge';
import { darwiniaDVMEthereum, pangolinDVMGoerli } from '../bridges/helix/substrateDVM-ethereum/config/bridge';
import { crabParachainKarura } from '../bridges/xcm/crabParachain-karura/config/bridge';
import { crabParachainMoonriver } from '../bridges/xcm/crabParachain-moonriver/config/bridge';
import { shidenKhala } from '../bridges/xcm/shiden-khala/config';
import { khalaShiden } from '../bridges/xcm/khala-shiden/config';
import { shidenKarura } from '../bridges/xcm/shiden-karura/config';
import { karuraShiden } from '../bridges/xcm/karura-shiden/config';
import { shidenMoonriver } from '../bridges/xcm/shiden-moonriver/config';
import { moonriverShiden } from '../bridges/xcm/moonriver-shiden/config';
import { moonriverKarura } from '../bridges/xcm/moonriver-karura/config';
import { karuraMoonriver } from '../bridges/xcm/karura-moonriver/config';
import { khalaKarura } from '../bridges/xcm/khala-karura/config';
import { karuraKhala } from '../bridges/xcm/karura-khala/config';
import { moonriverKhala } from '../bridges/xcm/moonriver-khala/config';
import { khalaMoonriver } from '../bridges/xcm/khala-moonriver/config';
import { crabDarwinia } from '../bridges/helixlp/crab-darwinia/config';
import { darwiniaEthereum } from '../bridges/helixlp/darwinia-ethereum/config';
import { arbitrumGoerli, arbitrumEthereum } from '../bridges/helixlp/arbitrum-ethereum/config';
import { arbitrumGoerliL2, ethereumArbitrumL2 } from '../bridges/l1tol2/ethereum-arbitrum/config';
import { arbitrumGoerliLnBridge, arbitrumEthereumLnBridge } from '../bridges/lnbridge/arbitrum-ethereum/config';

const formalBridges = [
  arbitrumAstar,
  arbitrumAvalanche,
  arbitrumOptimism,
  arbitrumPolygon,
  astarAvalanche,
  astarOptimism,
  avalancheOptimism,
  avalanchePolygon,
  bscArbitrum,
  bscAstar,
  bscAvalanche,
  bscOptimism,
  bscPolygon,
  crabDVMAstar,
  crabDVMcrabDVM,
  crabDVMDarwiniaDVM,
  crabDVMEthereum,
  crabDVMHeco,
  crabDVMPolygon,
  crabParachainKarura,
  crabParachainMoonriver,
  darwiniaDVMCrabDVM,
  darwiniaDVMDarwiniaDVM,
  darwiniaDVMEthereum,
  ethereumArbitrum,
  ethereumAstar,
  ethereumAvalanche,
  ethereumBSC,
  ethereumHeco,
  ethereumOptimism,
  ethereumPolygon,
  hecoPolygon,
  karuraMoonriver,
  karuraShiden,
  karuraKhala,
  khalaKarura,
  khalaMoonriver,
  khalaShiden,
  moonriverKarura,
  moonriverKhala,
  moonriverShiden,
  polygonAstar,
  polygonOptimism,
  shidenKarura,
  shidenKhala,
  shidenMoonriver,
  crabDarwinia,
  darwiniaEthereum,
  arbitrumEthereum,
  ethereumArbitrumL2,
  arbitrumEthereumLnBridge,
];

const testBridges = [
  pangolinDVMGoerli,
  pangoroDVMPangolinDVM,
  pangoroDVMPangoroDVM,
  arbitrumGoerli,
  arbitrumGoerliL2,
  arbitrumGoerliLnBridge,
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
