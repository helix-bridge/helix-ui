import { crabDVMConfig, astarConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMAstarBridgeConfig } from 'shared/model';

const crabDVMAstarConfig: CrabDVMAstarBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    redeem: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
  },
};

export const crabDVMAstar = new Bridge(crabDVMConfig, astarConfig, crabDVMAstarConfig, {
  name: 'crabDVM-astar',
  category: 'cBridge',
});
