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
    backing: '0xBfbCe15bb38a28add41f3Bf1B80E579ae7B7a4c0',
    issuing: '0xa5DE45d3eaabA9766B8494170F7E80fd41277a0B',
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
