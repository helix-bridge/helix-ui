import { crabDVMConfig, darwiniaDVMConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { CrabDVMDarwiniaDVMBridgeConfig } from '../model';

const crabDVMDarwiniaDVMConfig: CrabDVMDarwiniaDVMBridgeConfig = {
  contracts: {
    backing: '0xE0E888cA28738Fa2667b095d66bBAD15Fec5245E',
    issuing: '0xc9454EAc2815cd7677Ca7f237e8aDB226676DDbA',
  },
};

export const crabDVMDarwiniaDVM = new BridgeBase(crabDVMConfig, darwiniaDVMConfig, crabDVMDarwiniaDVMConfig, {
  name: 'crabDVM-darwiniaDVM',
  category: 'helix',
});

const crabDVMcrabDVMConfig: CrabDVMDarwiniaDVMBridgeConfig = {
  contracts: {
    backing: '0x2D2b97EA380b0185e9fDF8271d1AFB5d2Bf18329',
    issuing: '0x2D2b97EA380b0185e9fDF8271d1AFB5d2Bf18329',
  },
};

export const crabDVMcrabDVM = new BridgeBase(crabDVMConfig, crabDVMConfig, crabDVMcrabDVMConfig, {
  name: 'crabDVM-darwiniaDVM',
  category: 'helix',
  issueCompName: 'CrabDVMInner',
  redeemCompName: 'CrabDVMInner',
});
