import { bnbConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BnbAstarBridgeConfig } from 'shared/model';

const bnbAstarConfig: BnbAstarBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const bnbAstar = new Bridge(bnbConfig, astarConfig, bnbAstarConfig, {
  name: 'bnb-astar',
  category: 'cBridge',
});
