import { BridgeBase } from 'shared/core/bridge';
import { pangolinDVMConfig, pangoroDVMConfig } from 'shared/config/network';

export const unknownUnavailable = new BridgeBase(
  pangolinDVMConfig,
  pangoroDVMConfig,
  {},
  {
    category: 'helix',
    name: 'substrate-DVM',
    issueCompName: 'Unknown2Unavailable',
    redeemCompName: 'Unavailable2Unknown',
  }
);
