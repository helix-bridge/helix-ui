import { karuraConfig, moonriverConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { KaruraMoonriverBridgeConfig } from '../model';

const karuraMoonriverConfig: KaruraMoonriverBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '0x0000000000000000000000000000000000000804',
  },
};

export const karuraMoonriver = new BridgeBase(karuraConfig, moonriverConfig, karuraMoonriverConfig, {
  name: 'karura-moonriver',
  category: 'XCM',
  activeArrivalConnection: true,
});
