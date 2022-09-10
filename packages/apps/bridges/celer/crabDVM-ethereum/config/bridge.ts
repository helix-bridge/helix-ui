import { crabDVMConfig, ethereumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMEthereumBridgeConfig } from '../model';

const crabDVMEthereumConfig: CrabDVMEthereumBridgeConfig = {
  contracts: {
    backing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    issuing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    stablecoinBacking: '0x3b53D2C7B44d40BE05Fa5E2309FFeB6eB2492d88',
    stablecoinIssuing: '0xB37D31b2A74029B5951a2778F959282E2D518595',
  },
};

export const crabDVMEthereum = new Bridge(crabDVMConfig, ethereumConfig, crabDVMEthereumConfig, {
  name: 'crabDVM-ethereum',
  category: 'cBridge',
});
