import { ethereumConfig, arbitrumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumArbitrumBridgeConfig } from 'shared/model';

const ethereumArbitrumConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    issuing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    redeem: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
    stablecoinIssuing: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  },
};

export const ethereumArbitrum = new Bridge(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'cBridge',
});
