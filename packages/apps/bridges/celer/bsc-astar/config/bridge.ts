import { bscConfig, astarConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/model';
import { BSCAstarBridgeConfig } from '../model';

const bscAstarConfig: BSCAstarBridgeConfig = {
  contracts: {
    backing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    stablecoinIssuing: '0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573',
    stablecoinBacking: '0x78bc5Ee9F11d133A08b331C2e18fE81BE0Ed02DC',
    busdIssuing: '0x3b53d2c7b44d40be05fa5e2309ffeb6eb2492d88',
  },
};

export const bscAstar = new BridgeBase(bscConfig, astarConfig, bscAstarConfig, {
  name: 'bsc-astar',
  category: 'cBridge',
});
