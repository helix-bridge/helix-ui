import { crabParachainConfig, karuraConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/model';
import { CrabParachainKaruraBridgeConfig } from '../model';

const crabParachainKaruraConfig: CrabParachainKaruraBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const crabParachainKarura = new BridgeBase(crabParachainConfig, karuraConfig, crabParachainKaruraConfig, {
  name: 'crabParachain-karura',
  category: 'XCM',
  activeArrivalConnection: true,
});
