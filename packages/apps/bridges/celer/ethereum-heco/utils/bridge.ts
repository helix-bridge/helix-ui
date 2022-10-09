import { ethereumConfig, hecoConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { ethereumHecoConfig } from '../config';

export const ethereumHeco = new CBridgeBridge(ethereumConfig, hecoConfig, ethereumHecoConfig, {
  name: 'ethereum-heco',
  category: 'cBridge',
});
