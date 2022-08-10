import { avalancheConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { AvalancheOptimismBridgeConfig } from 'shared/model';

const avalancheOptimismConfig: AvalancheOptimismBridgeConfig = {
  contracts: {
    issuing: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
    redeem: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
  },
};

export const avalancheOptimism = new Bridge(avalancheConfig, optimismConfig, avalancheOptimismConfig, {
  name: 'avalanche-optimism',
  category: 'cBridge',
});
