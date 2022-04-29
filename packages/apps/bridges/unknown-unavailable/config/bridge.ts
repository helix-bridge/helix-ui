import { unknownConfig, unavailableConfig } from '../../../config/network';
import { Bridge } from '../../../model';
import { UnknownUnavailableBridgeConfig } from '../model/bridge';

const unknownUnavailableConfig: UnknownUnavailableBridgeConfig = {
  specVersion: 0,
};

export const unknownUnavailable = new Bridge(unknownConfig, unavailableConfig, unknownUnavailableConfig, {});
