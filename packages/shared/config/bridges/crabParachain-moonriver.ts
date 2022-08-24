import { crabParachainConfig, moonriverConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabParachainMoonriverBridgeConfig } from 'shared/model';

const crabParachainMoonriverConfig: CrabParachainMoonriverBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '0x0000000000000000000000000000000000000000',
  },
};

export const crabParachainMoonriver = new Bridge(crabParachainConfig, moonriverConfig, crabParachainMoonriverConfig, {
  name: 'crabParachain-moonriver',
  category: 'XCM',
});
