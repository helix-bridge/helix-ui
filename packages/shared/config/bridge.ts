import { crabDVMEthereum } from './bridges/crabDVM-ethereum';
import { crabDVMHeco } from './bridges/crabDVM-heco';
import { crabDVMPolygon } from './bridges/crabDVM-polygon';
import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { parachainCrab, parachainPangolin } from './bridges/parachain-substrate';
import { crabCrabDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './bridges/substrate-substrateDVM';
import { CHAIN_TYPE } from './env';

const formalBridges = [
  crabCrabDVM,
  darwiniaCrabDVM,
  ethereumDarwinia,
  parachainCrab,
  crabDVMHeco,
  crabDVMEthereum,
  crabDVMPolygon,
];

const testBridges = [pangolinPangolinDVM, pangoroPangolinDVM, ropstenPangolin, parachainPangolin];

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
