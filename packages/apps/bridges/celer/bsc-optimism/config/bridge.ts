import { bscConfig, optimismConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { BSCOptimismBridgeConfig } from '../model';

const bscOptimismConfig: BSCOptimismBridgeConfig = {
  contracts: {
    backing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    issuing: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
  },
};

export const bscOptimism = new BridgeBase(bscConfig, optimismConfig, bscOptimismConfig, {
  name: 'bsc-optimism',
  category: 'cBridge',
  issueCompName: 'BSC2Optimism',
  redeemCompName: 'Optimism2BSC',
});
