import { bnbConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BnbOptimismBridgeConfig } from 'shared/model';

const bnbOptimismConfig: BnbOptimismBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const bnbOptimism = new Bridge(bnbConfig, optimismConfig, bnbOptimismConfig, {
  name: 'bnb-optimism',
  category: 'cBridge',
});
