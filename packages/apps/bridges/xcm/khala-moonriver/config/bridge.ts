import { khalaConfig, moonriverConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { KhalaMoonriverBridgeConfig } from '../model';

const khalaMoonriverConfig: KhalaMoonriverBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '0x0000000000000000000000000000000000000804',
  },
};

export const khalaMoonriver = new BridgeBase(khalaConfig, moonriverConfig, khalaMoonriverConfig, {
  name: 'khala-moonriver',
  category: 'XCM',
  activeArrivalConnection: true,
});
