import { astarConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { AstarOptimismBridgeConfig } from 'shared/model';

const astarOptimismConfig: AstarOptimismBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const astarOptimism = new Bridge(astarConfig, optimismConfig, astarOptimismConfig, {
  name: 'astar-optimism',
  category: 'cBridge',
});
