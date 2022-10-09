import { arbitrumConfig, ethereumConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { ethereumArbitrumConfig } from '../config';

export const ethereumArbitrum = new CBridgeBridge(ethereumConfig, arbitrumConfig, ethereumArbitrumConfig, {
  name: 'ethereum-arbitrum',
  category: 'cBridge',
});
