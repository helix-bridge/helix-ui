import { ethereumConfig, arbitrumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumArbitrumBridgeConfig } from 'shared/model';

const ethereumArbitrumConfig: EthereumArbitrumBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const ethereumArbitrum = new Bridge(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'cBridge',
});
