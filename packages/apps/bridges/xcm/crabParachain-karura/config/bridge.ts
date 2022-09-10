import { crabParachainConfig, karuraConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabParachainKaruraBridgeConfig } from '../model';

const crabParachainKaruraConfig: CrabParachainKaruraBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '',
  },
};

export const crabParachainKarura = new Bridge(crabParachainConfig, karuraConfig, crabParachainKaruraConfig, {
  name: 'crabParachain-karura',
  category: 'XCM',
  activeArrivalConnection: true,
});
