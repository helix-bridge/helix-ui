import { arbitrumConfig, ethereumConfig } from 'shared/config/network';
import { arbitrumGoerliConfig, goerliConfig } from 'shared/config/network';
import { BridgeBase } from 'shared/core/bridge';
import { ArbitrumEthereumBridgeConfig } from '../model';

const arbitrumEthereumConfig: ArbitrumEthereumBridgeConfig = {
  contracts: {
    backing: '0xFBAD806Bdf9cEC2943be281FB355Da05068DE925',
    issuing: '0xb3BF74703976BdD817bf2b82660D24A777111981',
  },
};

const arbitrumGoerliGoerliConfig: ArbitrumEthereumBridgeConfig = {
  contracts: {
    backing: '0x7B8413FA1c1033844ac813A2E6475E15FB0fb3BA',
    issuing: '0x3B1A953bFa72Af4ae3494b08e453BFF30a06A550',
  },
};

export const arbitrumEthereum = new BridgeBase(arbitrumConfig, ethereumConfig, arbitrumEthereumConfig, {
  name: 'arbitrum-ethereum',
  category: 'helixLpBridge',
});

export const arbitrumGoerliLnBridge = new BridgeBase(arbitrumGoerliConfig, goerliConfig, arbitrumGoerliGoerliConfig, {
  name: 'arbitrum-ethereum',
  category: 'lnbridgev20',
});
