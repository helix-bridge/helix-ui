import { moonriverConfig, shidenConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { MoonriverShidenBridgeConfig } from '../model';

const moonriverShidenConfig: MoonriverShidenBridgeConfig = {
  contracts: {
    backing: '0x0000000000000000000000000000000000000804',
    issuing: '',
  },
};

export const moonriverShiden = new BridgeBase(moonriverConfig, shidenConfig, moonriverShidenConfig, {
  name: 'moonriver-shiden',
  category: 'XCM',
  activeArrivalConnection: true,
});
