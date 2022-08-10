import { arbitrumAstar } from './bridges/arbitrum-astar';
import { arbitrumAvalanche } from './bridges/arbitrum-avalanche';
import { arbitrumOptimism } from './bridges/arbitrum-optimism';
import { astarAvalanche } from './bridges/astar-avalanche';
import { astarOptimism } from './bridges/astar-optimism';
import { avalancheOptimism } from './bridges/avalanche-optimism';
import { bnbArbitrum } from './bridges/bnb-arbitrum';
import { bnbAstar } from './bridges/bnb-astar';
import { bnbAvalanche } from './bridges/bnb-avalanche';
import { bnbOptimism } from './bridges/bnb-optimism';
import { crabDVMEthereum } from './bridges/crabDVM-ethereum';
import { crabDVMHeco } from './bridges/crabDVM-heco';
import { crabDVMPolygon } from './bridges/crabDVM-polygon';
import { ethereumArbitrum } from './bridges/ethereum-arbitrum';
import { ethereumAstar } from './bridges/ethereum-astar';
import { ethereumAvalanche } from './bridges/ethereum-avalanche';
import { ethereumBnb } from './bridges/ethereum-bnb';
import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { ethereumHeco } from './bridges/ethereum-heco';
import { ethereumPolygon } from './bridges/ethereum-polygon';
import { hecoPolygon } from './bridges/heco-polygon';
import { parachainCrab, parachainPangolin } from './bridges/parachain-substrate';
import { polygonAstar } from './bridges/polygon-astar';
import { crabCrabDVM, darwiniaDarwiniaDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './bridges/substrate-substrateDVM';
import { darwiniaDVMCrabDVM, pangoroDVMPangolinDVM } from './bridges/substrateDVM-substrateDVM';
import { CHAIN_TYPE } from './env';

const formalBridges = [
  arbitrumAstar,
  arbitrumAvalanche,
  arbitrumOptimism,
  astarAvalanche,
  astarOptimism,
  avalancheOptimism,
  bnbArbitrum,
  bnbAstar,
  bnbAvalanche,
  bnbOptimism,
  crabCrabDVM,
  crabDVMEthereum,
  crabDVMHeco,
  crabDVMPolygon,
  darwiniaCrabDVM,
  darwiniaDarwiniaDVM,
  darwiniaDVMCrabDVM,
  ethereumDarwinia,
  ethereumHeco,
  ethereumPolygon,
  hecoPolygon,
  parachainCrab,
  polygonAstar,
  ethereumAstar,
  ethereumBnb,
  ethereumAvalanche,
  ethereumArbitrum,
];

const testBridges = [
  pangolinPangolinDVM,
  pangoroDVMPangolinDVM,
  pangoroPangolinDVM,
  parachainPangolin,
  ropstenPangolin,
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

export { darwiniaCrabDVM, pangoroPangolinDVM };
