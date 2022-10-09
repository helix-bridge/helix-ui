import { astarConfig, avalancheConfig } from 'shared/config/network';
import { CBridgeBridge } from '../../cBridge/utils';
import { astarAvalancheConfig } from '../config';

export const astarAvalanche = new CBridgeBridge(astarConfig, avalancheConfig, astarAvalancheConfig, {
  name: 'astar-avalanche',
  category: 'cBridge',
});
