import { ethereumConfig, arbitrumConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/model';
import { EthereumArbitrumBridgeConfig } from '../model';

const ethereumArbitrumConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
    stablecoinBacking: '0xB37D31b2A74029B5951a2778F959282E2D518595',
  },
};

export const ethereumArbitrum = new BridgeBase(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'cBridge',
});
