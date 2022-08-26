import { bscConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BSCAvalancheBridgeConfig } from 'shared/model';

const bscAvalancheConfig: BSCAvalancheBridgeConfig = {
  contracts: {
    backing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    issuing: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
  },
};

export const bscAvalanche = new Bridge(bscConfig, avalancheConfig, bscAvalancheConfig, {
  name: 'bsc-avalanche',
  category: 'cBridge',
});
