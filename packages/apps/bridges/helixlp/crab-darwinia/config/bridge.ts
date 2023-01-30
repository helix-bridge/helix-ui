import { crabDVMConfig, darwiniaDVMConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { CrabDarwiniaBridgeConfig } from '../model';

const crabDarwiniaConfig: CrabDarwiniaBridgeConfig = {
  contracts: {
    backing: '0x173f5694Eee6BBd1317D925Fb8C66E0C8966E00F',
    issuing: '0x1AfcfB0ca36d2cF3573281CBAd9457F5222df02a',
  },
};

export const crabDarwinia = new BridgeBase(crabDVMConfig, darwiniaDVMConfig, crabDarwiniaConfig, {
  name: 'crab-darwinia',
  category: 'helixLpBridge',
});
