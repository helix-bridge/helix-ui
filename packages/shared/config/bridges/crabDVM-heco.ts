import { crabDVMConfig, hecoConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMHecoBridgeConfig } from 'shared/model';

const crabDVMHecoConfig: CrabDVMHecoBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C', // base pool address on crab dvm
    redeem: '0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573', // base pool address on heco
  },
};

export const crabDVMHeco = new Bridge(crabDVMConfig, hecoConfig, crabDVMHecoConfig, {
  name: 'crabDVM-heco',
  category: 'cBridge',
});
