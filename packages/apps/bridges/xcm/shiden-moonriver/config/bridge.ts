import { shidenConfig, moonriverConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ShidenMoonriverBridgeConfig } from '../model';

const shidenMoonriverConfig: ShidenMoonriverBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '0x0000000000000000000000000000000000000804',
  },
};

export const shidenMoonriver = new BridgeBase(shidenConfig, moonriverConfig, shidenMoonriverConfig, {
  name: 'shiden-moonriver',
  category: 'XCM',
  activeArrivalConnection: true,
});
