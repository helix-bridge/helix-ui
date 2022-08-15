import { crabDVMConfig, arbitrumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMArbitrumBridgeConfig } from 'shared/model';

const crabDVMArbitrumConfig: CrabDVMArbitrumBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    redeem: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
  },
};

export const crabDVMArbitrum = new Bridge(crabDVMConfig, arbitrumConfig, crabDVMArbitrumConfig, {
  name: 'crabDVM-arbitrum',
  category: 'cBridge',
});
