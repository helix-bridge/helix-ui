import { Bridge, SubstrateSubstrateDVMBridgeConfig } from '../../model';
import { EVOLUTION_DOMAIN } from '../api';
import { darwiniaConfig, crabConfig, pangoroConfig, pangolinConfig } from '../network';

const darwiniaCrabDVMConfig: SubstrateSubstrateDVMBridgeConfig = {
  api: {
    dapp: 'https://api.darwinia.network',
    evolution: EVOLUTION_DOMAIN.product,
    subGraph: 'https://crab-thegraph.darwinia.network/subgraphs/name/wormhole/Sub2SubMappingTokenFactory',
    subql: 'https://api.subquery.network/sq/darwinia-network/wormhole-',
    //     subqlMMr: 'https://api.subquery.network/sq/darwinia-network/darwinia-mmr',
  },
  contracts: {
    issuing: '2qeMxq616BhswXHiiHp7H4VgaVv2S8xwkzWkoyoxcTA8v1YA',
    redeem: '0x3CC8913088F79831c8335f0307f4FC92d79C1ac7',
    genesis: '0x0000000000000000000000000000000000000000',
  },
};

export const darwiniaCrabDVM = new Bridge(darwiniaConfig, crabConfig, darwiniaCrabDVMConfig, {
  category: 'helix',
  activeAssistantConnection: true,
});

const pangoroPangolinDVMConfig: SubstrateSubstrateDVMBridgeConfig = {
  api: {
    dapp: 'https://api.darwinia.network.l2me.com',
    evolution: EVOLUTION_DOMAIN.dev,
    subGraph: 'https://pangolin-thegraph.darwinia.network/subgraphs/name/wormhole/Sub2SubMappingTokenFactory',
    subql: 'https://api.subquery.network/sq/darwinia-network/wormhole-',
  },
  contracts: {
    issuing: '',
    redeem: '',
    genesis: '0x0000000000000000000000000000000000000000',
  },
};

export const pangoroPangolinDVM = new Bridge(pangoroConfig, pangolinConfig, pangoroPangolinDVMConfig, {
  category: 'helix',
  activeAssistantConnection: true,
});
