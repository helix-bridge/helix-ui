import { polygonConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { PolygonAstarBridgeConfig } from 'shared/model';

const polygonAstarConfig: PolygonAstarBridgeConfig = {
  contracts: {
    backing: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    stableRedeem: '0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573',
  },
};

export const polygonAstar = new Bridge(polygonConfig, astarConfig, polygonAstarConfig, {
  name: 'polygon-astar',
  category: 'cBridge',
});
