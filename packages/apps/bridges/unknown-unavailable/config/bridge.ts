import { pangoroConfig, ropstenConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { Unknown2UnavailableBridgeConfig } from '../model';

const unknownUnavailableConfig: Unknown2UnavailableBridgeConfig = {};

export const unknownUnavailable = new Bridge(pangoroConfig, ropstenConfig, unknownUnavailableConfig, {
  stable: false,
  category: 'helix',
});
