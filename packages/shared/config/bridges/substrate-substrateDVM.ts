import { Bridge, SubstrateSubstrateDVMBridgeConfig } from '../../model';
import { EVOLUTION_DOMAIN } from '../api';
import { crabDVMConfig, darwiniaConfig, pangoroConfig } from '../network';
import { pangolinDVMConfig } from '../network/pangolin-dvm';

const darwiniaCrabDVMConfig: SubstrateSubstrateDVMBridgeConfig = {
  api: {
    dapp: 'https://api.darwinia.network',
    evolution: EVOLUTION_DOMAIN.product,
  },
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
  api: {
    dapp: 'https://api.darwinia.network.l2me.com',
    evolution: EVOLUTION_DOMAIN.dev,
  },
  contracts: {
    issuing: '',
    redeem: '',
    genesis: '0x0000000000000000000000000000000000000000',
  },
};

export const pangoroPangolinDVM = new Bridge(pangoroConfig, pangolinDVMConfig, pangoroPangolinDVMConfig, {
  category: 'helix',
  activeArrivalConnection: true,
  name: 'substrate-substrateDVM',
});
