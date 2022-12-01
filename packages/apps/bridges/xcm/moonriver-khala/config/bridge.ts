import { moonriverConfig, khalaConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { MoonriverKhalaBridgeConfig } from '../model';

const moonriverKhalaConfig: MoonriverKhalaBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const moonriverKhala = new BridgeBase(moonriverConfig, khalaConfig, moonriverKhalaConfig, {
  name: 'moonriver-khala',
  category: 'XCM',
  activeArrivalConnection: true,
});
