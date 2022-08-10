import { bnbConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BnbAvalancheBridgeConfig } from 'shared/model';

const bnbAvalancheConfig: BnbAvalancheBridgeConfig = {
  contracts: {
    issuing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    redeem: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
  },
};

export const bnbAvalanche = new Bridge(bnbConfig, avalancheConfig, bnbAvalancheConfig, {
  name: 'bnb-avalanche',
  category: 'cBridge',
});
