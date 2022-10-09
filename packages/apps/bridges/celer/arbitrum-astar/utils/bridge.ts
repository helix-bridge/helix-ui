import { arbitrumConfig, astarConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { arbitrumAstarConfig } from '../config';

export const arbitrumAstar = new CBridgeBridge(arbitrumConfig, astarConfig, arbitrumAstarConfig, {
  name: 'arbitrum-astar',
  category: 'cBridge',
});
