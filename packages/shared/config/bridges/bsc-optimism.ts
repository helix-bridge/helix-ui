import { bscConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BSCOptimismBridgeConfig } from 'shared/model';

const bscOptimismConfig: BSCOptimismBridgeConfig = {
  contracts: {
    issuing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    redeem: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
  },
};

export const bscOptimism = new Bridge(bscConfig, optimismConfig, bscOptimismConfig, {
  name: 'bsc-optimism',
  category: 'cBridge',
});
