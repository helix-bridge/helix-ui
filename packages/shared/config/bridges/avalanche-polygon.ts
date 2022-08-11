import { avalancheConfig, polygonConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { AvalanchePolygonBridgeConfig } from 'shared/model';

const avalanchePolygonConfig: AvalanchePolygonBridgeConfig = {
  contracts: {
    issuing: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
    redeem: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
  },
};

export const avalanchePolygon = new Bridge(avalancheConfig, polygonConfig, avalanchePolygonConfig, {
  name: 'avalanche-polygon',
  category: 'cBridge',
});
