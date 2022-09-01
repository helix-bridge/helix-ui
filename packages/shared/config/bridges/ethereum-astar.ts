import { ethereumConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumAstarBridgeConfig } from 'shared/model';

const ethereumAstarConfig: EthereumAstarBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    stablecoinIssuing: '0x3b53D2C7B44d40BE05Fa5E2309FFeB6eB2492d88',
    stablecoinBacking: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  },
};

export const ethereumAstar = new Bridge(ethereumConfig, astarConfig, ethereumAstarConfig, {
  name: 'ethereum-astar',
  category: 'cBridge',
});
