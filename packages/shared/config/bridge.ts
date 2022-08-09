import { bnbArbitrum } from './bridges/bnb-arbitrum';
import { bnbAstar } from './bridges/bnb-astar';
import { crabDVMEthereum } from './bridges/crabDVM-ethereum';
import { crabDVMHeco } from './bridges/crabDVM-heco';
import { crabDVMPolygon } from './bridges/crabDVM-polygon';
import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { ethereumHeco } from './bridges/ethereum-heco';
import { ethereumPolygon } from './bridges/ethereum-polygon';
import { hecoPolygon } from './bridges/heco-polygon';
import { parachainCrab, parachainPangolin } from './bridges/parachain-substrate';
import { crabCrabDVM, darwiniaDarwiniaDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './bridges/substrate-substrateDVM';
import { darwiniaDVMCrabDVM, pangoroDVMPangolinDVM } from './bridges/substrateDVM-substrateDVM';
import { CHAIN_TYPE } from './env';

const formalBridges = [
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
  parachainCrab,
  hecoPolygon,
  bnbArbitrum,
  bnbAstar,
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
