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
};

export const pangoroPangolinDVM = new Bridge(pangoroConfig, pangolinConfig, pangoroPangolinDVMConfig, {
  category: 'helix',
  activeAssistantConnection: true,
});
