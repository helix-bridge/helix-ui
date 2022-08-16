import { crabParachainConfig, karuraParachainConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabParachainKaruraParachainBridgeConfig } from 'shared/model';

const crabParachainKaruraParachainConfig: CrabParachainKaruraParachainBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const crabParachainKaruraParachain = new Bridge(
  crabParachainConfig,
  karuraParachainConfig,
  crabParachainKaruraParachainConfig,
  {
    name: 'crabParachain-karuraParachain',
    category: 'helix',
    activeArrivalConnection: true,
  }
);
