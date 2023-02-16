import { darwiniaDVMConfig, ethereumConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { DarwiniaEthereumBridgeConfig } from '../model';

const darwiniaEthereumConfig: DarwiniaEthereumBridgeConfig = {
  contracts: {
    backing: '0x84f7a56483C100ECb12CbB4A31b7873dAE0d8E9B',
    issuing: '0x5F8D4232367759bCe5d9488D3ade77FCFF6B9b6B',
  },
};

export const darwiniaEthereum = new BridgeBase(darwiniaDVMConfig, ethereumConfig, darwiniaEthereumConfig, {
  name: 'darwinia-ethereum',
  category: 'helixLpBridge',
  isDefault: true,
});
