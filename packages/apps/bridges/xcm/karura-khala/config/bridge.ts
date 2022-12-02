import { karuraConfig, khalaConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { KaruraKhalaBridgeConfig } from '../model';

const karuraKhalaConfig: KaruraKhalaBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const karuraKhala = new BridgeBase(karuraConfig, khalaConfig, karuraKhalaConfig, {
  name: 'karura-khala',
  category: 'XCM',
  activeArrivalConnection: true,
});
