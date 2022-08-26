import { ethereumConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumAvalancheBridgeConfig } from 'shared/model';

const ethereumAvalancheConfig: EthereumAvalancheBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
    stablecoinBacking: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  },
};

export const ethereumAvalanche = new Bridge(ethereumConfig, avalancheConfig, ethereumAvalancheConfig, {
  name: 'ethereum-avalanche',
  category: 'cBridge',
});
