import { avalancheConfig, ethereumConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { ethereumAvalancheConfig } from '../config';

export const ethereumAvalanche = new CBridgeBridge(ethereumConfig, avalancheConfig, ethereumAvalancheConfig, {
  name: 'ethereum-avalanche',
  category: 'cBridge',
});
