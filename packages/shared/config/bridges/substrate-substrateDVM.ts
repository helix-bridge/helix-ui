import { Bridge, SubstrateSubstrateDVMBridgeConfig } from '../../model';
import { crabDVMConfig, darwiniaConfig, pangoroConfig } from '../network';
import { pangolinDVMConfig } from '../network/pangolin-dvm';

const darwiniaCrabDVMConfig: SubstrateSubstrateDVMBridgeConfig = {
  contracts: {
    issuing: '2qeMxq616BhswXHiiHp7H4VgaVv2S8xwkzWkoyoxcTA8v1YA',
    redeem: '0x3CC8913088F79831c8335f0307f4FC92d79C1ac7',
    genesis: '0x0000000000000000000000000000000000000000',
  },
};

export const darwiniaCrabDVM = new Bridge(darwiniaConfig, crabDVMConfig, darwiniaCrabDVMConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'substrate-substrateDVM',
});

const pangoroPangolinDVMConfig: SubstrateSubstrateDVMBridgeConfig = {
  contracts: {
    issuing: '0xb142658bd18c560d8ea74a31c07297cecfecf949',
    redeem: '0x92496871560a01551e1b4fd04540d7a519d5c19e',
    genesis: '0x0000000000000000000000000000000000000000',
  },
};

export const pangoroPangolinDVM = new Bridge(pangoroConfig, pangolinDVMConfig, pangoroPangolinDVMConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'substrate-substrateDVM',
});
