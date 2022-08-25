import { crabDVMConfig, ethereumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMEthereumBridgeConfig } from 'shared/model';

const crabDVMEthereumConfig: CrabDVMEthereumBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    redeem: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    stablecoinIssuing: '0xBB7684Cc5408F4DD0921E5c2Cadd547b8f1AD573',
    stablecoinRedeem: '0xB37D31b2A74029B5951a2778F959282E2D518595',
  },
};

export const crabDVMEthereum = new Bridge(crabDVMConfig, ethereumConfig, crabDVMEthereumConfig, {
  name: 'crabDVM-ethereum',
  category: 'cBridge',
});
