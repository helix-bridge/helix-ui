import { polygonConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { PolygonAstarBridgeConfig } from 'shared/model';

const polygonAstarConfig: PolygonAstarBridgeConfig = {
  contracts: {
    issuing: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
    redeem: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
  },
};

export const polygonAstar = new Bridge(polygonConfig, astarConfig, polygonAstarConfig, {
  name: 'polygon-astar',
  category: 'cBridge',
});
