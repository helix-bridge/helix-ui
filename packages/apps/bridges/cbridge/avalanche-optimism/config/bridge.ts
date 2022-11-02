import { avalancheConfig, optimismConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { AvalancheOptimismBridgeConfig } from '../model';

const avalancheOptimismConfig: AvalancheOptimismBridgeConfig = {
  contracts: {
    backing: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
    issuing: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
  },
};

export const avalancheOptimism = new BridgeBase(avalancheConfig, optimismConfig, avalancheOptimismConfig, {
  name: 'avalanche-optimism',
  category: 'cBridge',
});