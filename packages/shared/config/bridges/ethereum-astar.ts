import { ethereumConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumAstarBridgeConfig } from 'shared/model';

const ethereumAstarConfig: EthereumAstarBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    stablecoinIssuing: '0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573',
    stablecoinBacking: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  },
};

export const ethereumAstar = new Bridge(ethereumConfig, astarConfig, ethereumAstarConfig, {
  name: 'ethereum-astar',
  category: 'cBridge',
});
