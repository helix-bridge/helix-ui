import { arbitrumConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { ArbitrumAvalancheBridgeConfig } from 'shared/model';

const arbitrumAvalancheConfig: ArbitrumAvalancheBridgeConfig = {
  contracts: {
    issuing: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
    redeem: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
  },
};

export const arbitrumAvalanche = new Bridge(arbitrumConfig, avalancheConfig, arbitrumAvalancheConfig, {
  name: 'arbitrum-avalanche',
  category: 'cBridge',
});
