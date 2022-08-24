import { crabParachainConfig, karuraConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabParachainKaruraBridgeConfig } from 'shared/model';

const crabParachainKaruraConfig: CrabParachainKaruraBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const crabParachainKarura = new Bridge(crabParachainConfig, karuraConfig, crabParachainKaruraConfig, {
  name: 'crabParachain-karura',
  category: 'XCM',
  activeArrivalConnection: true,
});
