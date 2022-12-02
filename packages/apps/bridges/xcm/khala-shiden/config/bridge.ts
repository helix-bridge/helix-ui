import { khalaConfig, shidenConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { KhalaShidenBridgeConfig } from '../model';

const khalaShidenConfig: KhalaShidenBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const khalaShiden = new BridgeBase(khalaConfig, shidenConfig, khalaShidenConfig, {
  name: 'khala-shiden',
  category: 'XCM',
  activeArrivalConnection: true,
});
