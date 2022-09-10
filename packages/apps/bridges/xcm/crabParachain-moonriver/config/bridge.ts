import { crabParachainConfig, moonriverConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabParachainMoonriverBridgeConfig } from '../model';

const crabParachainMoonriverConfig: CrabParachainMoonriverBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '0x0000000000000000000000000000000000000804',
  },
};

export const crabParachainMoonriver = new Bridge(crabParachainConfig, moonriverConfig, crabParachainMoonriverConfig, {
  name: 'crabParachain-moonriver',
  category: 'XCM',
});
