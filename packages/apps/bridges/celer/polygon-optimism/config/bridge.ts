import { polygonConfig, optimismConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { PolygonOptimismBridgeConfig } from '../model';

const polygonOptimismConfig: PolygonOptimismBridgeConfig = {
  contracts: {
    backing: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
    issuing: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
  },
};

export const polygonOptimism = new BridgeBase(polygonConfig, optimismConfig, polygonOptimismConfig, {
  name: 'polygon-optimism',
  category: 'cBridge',
});
