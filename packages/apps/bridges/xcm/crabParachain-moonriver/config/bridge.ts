import { crabParachainConfig, moonriverConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { CrabParachainMoonriverBridgeConfig } from '../model';

const crabParachainMoonriverConfig: CrabParachainMoonriverBridgeConfig = {
  contracts: {
    backing: '',
    issuing: '0x0000000000000000000000000000000000000804',
  },
};

export const crabParachainMoonriver = new BridgeBase(
  crabParachainConfig,
  moonriverConfig,
  crabParachainMoonriverConfig,
  {
    name: 'crabParachain-moonriver',
    category: 'XCM',
  }
);
