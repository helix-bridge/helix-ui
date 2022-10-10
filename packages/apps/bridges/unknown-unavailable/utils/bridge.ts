import { crabConfig, pangoroConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { unknownUnavailableConfig } from '../config';

export const unknownUnavailable = new BridgeBase(pangoroConfig, crabConfig, unknownUnavailableConfig, {
  category: 'helix',
  name: 'substrate-DVM',
  issueCompName: 'Unknown2Unavailable',
  redeemCompName: 'Unavailable2Unknown',
});
