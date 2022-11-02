import { bscConfig, polygonConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { BSCPolygonBridgeConfig } from '../model';

const bscPolygonConfig: BSCPolygonBridgeConfig = {
  contracts: {
    backing: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
    issuing: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
  },
};

export const bscPolygon = new BridgeBase(bscConfig, polygonConfig, bscPolygonConfig, {
  name: 'bsc-polygon',
  category: 'cBridge',
  issueCompName: 'BSC2Polygon',
  redeemCompName: 'Polygon2BSC',
});
