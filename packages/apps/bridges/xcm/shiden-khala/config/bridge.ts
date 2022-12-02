import { shidenConfig, khalaConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ShidenKhalaBridgeConfig } from '../model';

const shidenKhalaConfig: ShidenKhalaBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const shidenKhala = new BridgeBase(shidenConfig, khalaConfig, shidenKhalaConfig, {
  name: 'shiden-khala',
  category: 'XCM',
  activeArrivalConnection: true,
});
