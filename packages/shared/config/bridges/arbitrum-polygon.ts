import { arbitrumConfig, polygonConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { ArbitrumPolygonBridgeConfig } from 'shared/model';

const arbitrumPolygonConfig: ArbitrumPolygonBridgeConfig = {
  contracts: {
    issuing: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
    redeem: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
  },
};

export const arbitrumPolygon = new Bridge(arbitrumConfig, polygonConfig, arbitrumPolygonConfig, {
  name: 'arbitrum-polygon',
  category: 'cBridge',
});
