import { arbitrumConfig, ethereumConfig } from 'shared/config/network';
import { zksyncGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ZksyncEthereumBridgeConfig } from '../model';

const arbitrumEthereumConfig: ZksyncEthereumBridgeConfig = {
  contracts: {
    backing: '0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978',
    issuing: '0xeAb1F01a8f4A2687023B159c2063639Adad5304E',
  },
};

const zksyncGoerliGoerliConfig: ZksyncEthereumBridgeConfig = {
  contracts: {
    backing: '0x9422E7883d1F9Dd2E0f5926D585115542D6C71dA',
    issuing: '0x6E7b0Af10aB840a47c47AeC97107487D2a17Eb2F',
  },
};

export const arbitrumEthereumLnBridge = new BridgeBase(arbitrumConfig, ethereumConfig, arbitrumEthereumConfig, {
  name: 'arbitrum-ethereum',
  category: 'lnbridgev20-opposite',
});

export const zksyncGoerliGoerliLnBridge = new BridgeBase(zksyncGoerliConfig, goerliConfig, zksyncGoerliGoerliConfig, {
  name: 'zksync-ethereum',
  category: 'lnbridgev20-opposite',
});
