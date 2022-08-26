import { astarConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { AstarOptimismBridgeConfig } from 'shared/model';

const astarOptimismConfig: AstarOptimismBridgeConfig = {
  contracts: {
    backing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    issuing: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
    stablecoinBacking: '0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573',
  },
};

export const astarOptimism = new Bridge(astarConfig, optimismConfig, astarOptimismConfig, {
  name: 'astar-optimism',
  category: 'cBridge',
});
