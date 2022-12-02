import { khalaConfig, karuraConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { KhalaKaruraBridgeConfig } from '../model';

const khalaKaruraConfig: KhalaKaruraBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const khalaKarura = new BridgeBase(khalaConfig, karuraConfig, khalaKaruraConfig, {
  name: 'khala-karura',
  category: 'XCM',
  activeArrivalConnection: true,
});
