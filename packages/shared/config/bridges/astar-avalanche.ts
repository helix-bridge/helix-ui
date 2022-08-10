import { astarConfig, avalancheConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { AstarAvalancheBridgeConfig } from 'shared/model';

const astarAvalancheConfig: AstarAvalancheBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const astarAvalanche = new Bridge(astarConfig, avalancheConfig, astarAvalancheConfig, {
  name: 'astar-avalanche',
  category: 'cBridge',
});
