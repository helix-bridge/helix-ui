import { arbitrumConfig, ethereumConfig } from 'shared/config/network';
import { arbitrumGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ArbitrumEthereumBridgeConfig } from '../model';

const arbitrumEthereumConfig: ArbitrumEthereumBridgeConfig = {
  contracts: {
    backing: '0xD1B10B114f1975d8BCc6cb6FC43519160e2AA978',
    issuing: '0xeAb1F01a8f4A2687023B159c2063639Adad5304E',
  },
};

const arbitrumGoerliGoerliConfig: ArbitrumEthereumBridgeConfig = {
  contracts: {
    backing: '0x79e6f452f1e491a7aF0382FA0a6EF9368691960D',
    issuing: '',
  },
};

export const arbitrumEthereumLnBridge = new BridgeBase(arbitrumConfig, ethereumConfig, arbitrumEthereumConfig, {
  name: 'arbitrum-ethereum',
  category: 'lnbridgev20-opposite',
});

export const arbitrumGoerliLnBridge = new BridgeBase(arbitrumGoerliConfig, goerliConfig, arbitrumGoerliGoerliConfig, {
  name: 'arbitrum-ethereum',
  category: 'lnbridgev20-opposite',
});
