import { ethereumConfig, polygonConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumPolygonBridgeConfig } from 'shared/model';

const ethereumPolygonConfig: EthereumPolygonBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
    stablecoinBacking: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  },
};

export const ethereumPolygon = new Bridge(ethereumConfig, polygonConfig, ethereumPolygonConfig, {
  name: 'ethereum-polygon',
  category: 'cBridge',
});
