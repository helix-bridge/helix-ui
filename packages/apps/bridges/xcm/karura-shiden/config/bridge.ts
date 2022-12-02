import { karuraConfig, shidenConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { KaruraShidenBridgeConfig } from '../model';

const karuraShidenConfig: KaruraShidenBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const karuraShiden = new BridgeBase(karuraConfig, shidenConfig, karuraShidenConfig, {
  name: 'karura-shiden',
  category: 'XCM',
  activeArrivalConnection: true,
});
