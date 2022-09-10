import { Bridge } from 'shared/model';
import { crabConfig, pangoroConfig } from 'shared/config/network';

export const unknownUnavailable = new Bridge(
  pangoroConfig,
  crabConfig,
  {},
  {
    category: 'helix',
    name: 'substrate-DVM',
    issueCompName: 'Unknown2Unavailable',
    redeemCompName: 'Unavailable2Unknown',
  }
);
