import { bscConfig, arbitrumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BSCArbitrumBridgeConfig } from 'shared/model';

const bscArbitrumConfig: BSCArbitrumBridgeConfig = {
  contracts: {
    backing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    issuing: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
  },
};

export const bscArbitrum = new Bridge(bscConfig, arbitrumConfig, bscArbitrumConfig, {
  name: 'bsc-arbitrum',
  category: 'cBridge',
});
