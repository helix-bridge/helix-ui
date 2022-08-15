import { bscConfig, polygonConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { BSCPolygonBridgeConfig } from 'shared/model';

const bscPolygonConfig: BSCPolygonBridgeConfig = {
  contracts: {
    issuing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    redeem: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
  },
};

export const bscPolygon = new Bridge(bscConfig, polygonConfig, bscPolygonConfig, {
  name: 'bsc-polygon',
  category: 'cBridge',
});
