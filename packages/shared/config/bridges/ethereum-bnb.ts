import { ethereumConfig, bnbConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumBnbBridgeConfig } from 'shared/model';

const ethereumBnbConfig: EthereumBnbBridgeConfig = {
  contracts: {
    issuing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    redeem: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
  },
};

export const ethereumBnb = new Bridge(ethereumConfig, bnbConfig, ethereumBnbConfig, {
  name: 'ethereum-bnb',
  category: 'cBridge',
});
