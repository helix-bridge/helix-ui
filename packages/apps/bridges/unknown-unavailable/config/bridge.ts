import { BridgeBase } from 'shared/core/bridge';
import { pangolinConfig, pangoroConfig } from 'shared/config/network';

export const unknownUnavailable = new BridgeBase(
  pangolinConfig,
  pangoroConfig,
  {},
  {
    category: 'helix',
    name: 'substrate-DVM',
    issueCompName: 'Unknown2Unavailable',
    redeemCompName: 'Unavailable2Unknown',
  }
);
