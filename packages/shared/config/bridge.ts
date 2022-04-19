import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { ethereumCrabDVM, ropstenPangolinDVM } from './bridges/ethereum-dvm';
import { crabCrabDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './bridges/substrate-substrateDVM';

export const BRIDGES = [
  crabCrabDVM,
  darwiniaCrabDVM,
  ethereumCrabDVM,
  ethereumDarwinia,
  pangolinPangolinDVM,
  pangoroPangolinDVM,
  ropstenPangolin,
  ropstenPangolinDVM,
];

export { darwiniaCrabDVM, pangoroPangolinDVM };
