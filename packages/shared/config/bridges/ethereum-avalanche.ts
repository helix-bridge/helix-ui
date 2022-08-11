import { ethereumConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumAvalancheBridgeConfig } from 'shared/model';

const ethereumAvalancheConfig: EthereumAvalancheBridgeConfig = {
  contracts: {
    issuing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    redeem: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
  },
};

export const ethereumAvalanche = new Bridge(ethereumConfig, avalancheConfig, ethereumAvalancheConfig, {
  name: 'ethereum-avalanche',
  category: 'cBridge',
});
