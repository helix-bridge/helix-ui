import { ethereumConfig, optimismConfig } from 'shared/config/network';
import { Bridge } from 'shared/model';
import { EthereumOptimismBridgeConfig } from 'shared/model';

const ethereumOptimismConfig: EthereumOptimismBridgeConfig = {
  contracts: {
    backing: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
    issuing: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
    stablecoinBacking: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1',
  },
};

export const ethereumOptimism = new Bridge(ethereumConfig, optimismConfig, ethereumOptimismConfig, {
  name: 'ethereum-optimism',
  category: 'cBridge',
});
