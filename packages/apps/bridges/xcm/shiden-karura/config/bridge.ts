import { shidenConfig, karuraConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ShidenKaruraBridgeConfig } from '../model';

const shidenKaruraConfig: ShidenKaruraBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const shidenKarura = new BridgeBase(shidenConfig, karuraConfig, shidenKaruraConfig, {
  name: 'shiden-karura',
  category: 'XCM',
  activeArrivalConnection: true,
});
