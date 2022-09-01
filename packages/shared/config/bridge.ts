import { arbitrumAstar } from './bridges/arbitrum-astar';
import { arbitrumAvalanche } from './bridges/arbitrum-avalanche';
import { arbitrumOptimism } from './bridges/arbitrum-optimism';
import { arbitrumPolygon } from './bridges/arbitrum-polygon';
import { astarAvalanche } from './bridges/astar-avalanche';
import { astarOptimism } from './bridges/astar-optimism';
import { avalancheOptimism } from './bridges/avalanche-optimism';
import { avalanchePolygon } from './bridges/avalanche-polygon';
import { bscArbitrum } from './bridges/bsc-arbitrum';
import { bscAstar } from './bridges/bsc-astar';
import { bscAvalanche } from './bridges/bsc-avalanche';
import { bscOptimism } from './bridges/bsc-optimism';
import { bscPolygon } from './bridges/bsc-polygon';
import { crabDVMAstar } from './bridges/crabDVM-astar';
import { crabDVMEthereum } from './bridges/crabDVM-ethereum';
import { crabDVMHeco } from './bridges/crabDVM-heco';
import { crabDVMPolygon } from './bridges/crabDVM-polygon';
import { crabParachainKarura } from './bridges/crabParachain-karura';
import { crabParachainMoonriver } from './bridges/crabParachain-moonriver';
import { ethereumArbitrum } from './bridges/ethereum-arbitrum';
import { ethereumAstar } from './bridges/ethereum-astar';
import { ethereumAvalanche } from './bridges/ethereum-avalanche';
import { ethereumBSC } from './bridges/ethereum-bsc';
import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { ethereumHeco } from './bridges/ethereum-heco';
import { ethereumOptimism } from './bridges/ethereum-optimism';
import { ethereumPolygon } from './bridges/ethereum-polygon';
import { hecoPolygon } from './bridges/heco-polygon';
import { crabCrabParachain, pangolinPangolinParachain } from './bridges/substrate-substrateParachain';
import { polygonAstar } from './bridges/polygon-astar';
import { polygonOptimism } from './bridges/polygon-optimism';
import { crabCrabDVM, darwiniaDarwiniaDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaDVMCrabDVM, darwiniaDVMDarwiniaDVM, pangoroDVMPangolinDVM } from './bridges/substrateDVM-substrateDVM';
import { CHAIN_TYPE } from './env';

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
  darwiniaDVMCrabDVM,
  darwiniaDVMDarwiniaDVM,
  ethereumDarwinia,
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

const testBridges = [pangolinPangolinDVM, pangoroDVMPangolinDVM, pangolinPangolinParachain, ropstenPangolin];

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
