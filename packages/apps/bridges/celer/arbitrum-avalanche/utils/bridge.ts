import { arbitrumConfig, avalancheConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { arbitrumAvalancheConfig } from '../config';

export const arbitrumAvalanche = new CBridgeBridge(arbitrumConfig, avalancheConfig, arbitrumAvalancheConfig, {
  name: 'arbitrum-avalanche',
  category: 'cBridge',
});
