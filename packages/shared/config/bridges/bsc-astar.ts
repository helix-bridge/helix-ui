import { bscConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BSCAstarBridgeConfig } from 'shared/model';

const bscAstarConfig: BSCAstarBridgeConfig = {
  contracts: {
    issuing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    redeem: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    stablecoinRedeem: '0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573',
  },
};

export const bscAstar = new Bridge(bscConfig, astarConfig, bscAstarConfig, {
  name: 'bsc-astar',
  category: 'cBridge',
});
