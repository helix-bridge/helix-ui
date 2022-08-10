import { avalancheConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { AvalancheOptimismBridgeConfig } from 'shared/model';

const avalancheOptimismConfig: AvalancheOptimismBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const avalancheOptimism = new Bridge(avalancheConfig, optimismConfig, avalancheOptimismConfig, {
  name: 'avalanche-optimism',
  category: 'cBridge',
});
