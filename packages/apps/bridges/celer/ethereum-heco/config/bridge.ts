import { ethereumConfig, hecoConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumHecoBridgeConfig } from '../model';

const ethereumHecoConfig: EthereumHecoBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573',
  },
};

export const ethereumHeco = new Bridge(ethereumConfig, hecoConfig, ethereumHecoConfig, {
  name: 'ethereum-heco',
  category: 'cBridge',
});
