import { moonriverConfig, khalaConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { MoonriverKhalaBridgeConfig } from '../model';

const moonriverKhalaConfig: MoonriverKhalaBridgeConfig = {
  contracts: {
    backing: '0x0000000000000000000000000000000000000804',
    issuing: '',
  },
};

export const moonriverKhala = new BridgeBase(moonriverConfig, khalaConfig, moonriverKhalaConfig, {
  name: 'moonriver-khala',
  category: 'XCM',
  activeArrivalConnection: true,
});
