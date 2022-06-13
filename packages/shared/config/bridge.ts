import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { parachainCrab, parachainPangolin } from './bridges/parachain-substrate';
import { crabCrabDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './bridges/substrate-substrateDVM';
import { CHAIN_TYPE } from './env';

const formalBridges = [crabCrabDVM, darwiniaCrabDVM, ethereumDarwinia, parachainCrab];

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
