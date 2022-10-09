import { arbitrumConfig, bscConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { bscArbitrumConfig } from '../config';

export const bscArbitrum = new CBridgeBridge(bscConfig, arbitrumConfig, bscArbitrumConfig, {
  name: 'bsc-arbitrum',
  category: 'cBridge',
});
