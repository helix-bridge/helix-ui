import { omit } from 'lodash';
import { Bridge, BridgeConfig } from '../model';
import { ethereumDarwinia, ropstenPangolin } from './bridges/ethereum-darwinia';
import { ethereumCrabDVM, ropstenPangolinDVM } from './bridges/ethereum-dvm';
import { crabCrabDVM, pangolinPangolinDVM } from './bridges/substrate-dvm';
import { darwiniaCrabDVM, pangoroPangolinDVM } from './bridges/substrate-substrateDVM';
import { crabConfig, ethereumConfig, tronConfig } from './network';

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

const ethereumCrabConfig: BridgeConfig = {};

const tronCrabConfig: BridgeConfig = {};

const crabNative = omit(crabConfig, 'dvm');
const ethereumCrab = new Bridge(ethereumConfig, crabNative, ethereumCrabConfig, { category: 'helix' });
const tronCrab = new Bridge(tronConfig, crabNative, tronCrabConfig, { category: 'helix' });

export const AIRDROPS = [ethereumCrab, tronCrab];

export { darwiniaCrabDVM, pangoroPangolinDVM };
