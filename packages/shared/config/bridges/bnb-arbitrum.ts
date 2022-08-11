import { bnbConfig, arbitrumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BnbArbitrumBridgeConfig } from 'shared/model';

const bnbArbitrumConfig: BnbArbitrumBridgeConfig = {
  contracts: {
    issuing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    redeem: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
  },
};

export const bnbArbitrum = new Bridge(bnbConfig, arbitrumConfig, bnbArbitrumConfig, {
  name: 'bnb-arbitrum',
  category: 'cBridge',
});
