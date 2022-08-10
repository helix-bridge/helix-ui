import { bnbConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BnbAvalancheBridgeConfig } from 'shared/model';

const bnbAvalancheConfig: BnbAvalancheBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const bnbAvalanche = new Bridge(bnbConfig, avalancheConfig, bnbAvalancheConfig, {
  name: 'bnb-avalanche',
  category: 'cBridge',
});
