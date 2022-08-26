import { crabDVMConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMAstarBridgeConfig } from 'shared/model';

const crabDVMAstarConfig: CrabDVMAstarBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    redeem: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    stablecoinIssuing: '0x3b53D2C7B44d40BE05Fa5E2309FFeB6eB2492d88',
    stablecoinRedeem: '0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573',
  },
};

export const crabDVMAstar = new Bridge(crabDVMConfig, astarConfig, crabDVMAstarConfig, {
  name: 'crabDVM-astar',
  category: 'cBridge',
  disableIssuing: true,
  disableRedeem: true,
});
