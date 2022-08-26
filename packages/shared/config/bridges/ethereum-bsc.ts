import { ethereumConfig, bscConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumBSCBridgeConfig } from 'shared/model';

const ethereumBSCConfig: EthereumBSCBridgeConfig = {
  contracts: {
    issuing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    redeem: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    stablecoinIssuing: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  },
};

export const ethereumBSC = new Bridge(ethereumConfig, bscConfig, ethereumBSCConfig, {
  name: 'ethereum-bsc',
  category: 'cBridge',
});
