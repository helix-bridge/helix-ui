import { ethereumConfig, optimismConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/model';
import { EthereumOptimismBridgeConfig } from '../model';

const ethereumOptimismConfig: EthereumOptimismBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
    stablecoinBacking: '0xB37D31b2A74029B5951a2778F959282E2D518595',
  },
};

export const ethereumOptimism = new BridgeBase(ethereumConfig, optimismConfig, ethereumOptimismConfig, {
  name: 'ethereum-optimism',
  category: 'cBridge',
});
