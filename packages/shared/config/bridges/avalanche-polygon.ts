import { avalancheConfig, polygonConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { AvalanchePolygonBridgeConfig } from 'shared/model';

const avalanchePolygonConfig: AvalanchePolygonBridgeConfig = {
  contracts: {
    issuing: '',
    redeem: '',
  },
};

export const avalanchePolygon = new Bridge(avalancheConfig, polygonConfig, avalanchePolygonConfig, {
  name: 'avalanche-polygon',
  category: 'cBridge',
});
