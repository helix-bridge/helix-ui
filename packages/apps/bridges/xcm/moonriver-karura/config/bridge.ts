import { moonriverConfig, karuraConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { MoonriverKaruraBridgeConfig } from '../model';

const moonriverKaruraConfig: MoonriverKaruraBridgeConfig = {
  contracts: {
    backing: '0x0000000000000000000000000000000000000804',
    issuing: '',
  },
};

export const moonriverKarura = new BridgeBase(moonriverConfig, karuraConfig, moonriverKaruraConfig, {
  name: 'moonriver-karura',
  category: 'XCM',
  activeArrivalConnection: true,
});
