import { ethereumConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumAvalancheBridgeConfig } from '../model';

const ethereumAvalancheConfig: EthereumAvalancheBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
    stablecoinBacking: '0xB37D31b2A74029B5951a2778F959282E2D518595',
  },
};

export const ethereumAvalanche = new Bridge(ethereumConfig, avalancheConfig, ethereumAvalancheConfig, {
  name: 'ethereum-avalanche',
  category: 'cBridge',
});