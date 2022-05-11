import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { crabCrabDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './bridges/substrate-substrateDVM';

export const BRIDGES = [
  crabCrabDVM,
  darwiniaCrabDVM,
  ethereumDarwinia,
  pangolinPangolinDVM,
  pangoroPangolinDVM,
  ropstenPangolin,
];

export { darwiniaCrabDVM, pangoroPangolinDVM };
