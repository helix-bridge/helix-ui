import { arbitrumConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { ArbitrumAstarBridgeConfig } from 'shared/model';

const arbitrumAstarConfig: ArbitrumAstarBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const arbitrumAstar = new Bridge(arbitrumConfig, astarConfig, arbitrumAstarConfig, {
  name: 'arbitrum-astar',
  category: 'cBridge',
});
