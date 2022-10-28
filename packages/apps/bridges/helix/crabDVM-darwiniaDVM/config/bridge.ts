import { crabDVMConfig, darwiniaDVMConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { CrabDVMDarwiniaDVMBridgeConfig } from '../model';

const crabDVMDarwiniaDVMConfig: CrabDVMDarwiniaDVMBridgeConfig = {
  contracts: {
    backing: '0xCF8923ebF4244cedC647936a0281dd10bDFCBF18',
    issuing: '0x8c585F9791EE5b4B23fe82888cE576DBB69607eB',
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
