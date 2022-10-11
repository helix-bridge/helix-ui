import { hecoConfig, polygonConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { HecoPolygonBridgeConfig } from '../model';

const hecoPolygonConfig: HecoPolygonBridgeConfig = {
  contracts: {
    backing: '0xbb7684cc5408f4dd0921e5c2cadd547b8f1ad573',
    issuing: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
  },
};

export const hecoPolygon = new BridgeBase(hecoConfig, polygonConfig, hecoPolygonConfig, {
  name: 'heco-polygon',
  category: 'cBridge',
  disableIssue: true,
  disableRedeem: true,
});
