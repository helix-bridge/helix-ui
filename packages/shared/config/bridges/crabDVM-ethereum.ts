import { crabDVMConfig, ethereumConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { CrabDVMEthereumBridgeConfig } from 'shared/model';

const crabDVMEthereumConfig: CrabDVMEthereumBridgeConfig = {
  contracts: {
    issuing: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
    redeem: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
  },
};

export const crabDVMEthereum = new Bridge(crabDVMConfig, ethereumConfig, crabDVMEthereumConfig, {
  name: 'crabDVM-ethereum',
  category: 'cBridge',
});
