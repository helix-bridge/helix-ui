import { arbitrumConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { ArbitrumAvalancheBridgeConfig } from 'shared/model';

const arbitrumAvalancheConfig: ArbitrumAvalancheBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const arbitrumAvalanche = new Bridge(arbitrumConfig, avalancheConfig, arbitrumAvalancheConfig, {
  name: 'arbitrum-avalanche',
  category: 'cBridge',
});
