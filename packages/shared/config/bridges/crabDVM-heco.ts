import { crabDVMConfig, hecoConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMHecoBridgeConfig } from 'shared/model';

const crabDVMHecoConfig: CrabDVMHecoBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const crabDVMHeco = new Bridge(crabDVMConfig, hecoConfig, crabDVMHecoConfig, {
  name: 'crabDVM-heco',
  category: 'helix',
});
