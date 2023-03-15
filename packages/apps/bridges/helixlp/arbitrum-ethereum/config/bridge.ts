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
    backing: '0x89AF830781A2C1d3580Db930bea11094F55AfEae',
    issuing: '0x3d33856dCf74f110690f5a2647C7dFb9BB5Ff2d0',
  },
};

export const arbitrumEthereum = new BridgeBase(arbitrumConfig, ethereumConfig, arbitrumEthereumConfig, {
  name: 'arbitrum-ethereum',
  category: 'helixLpBridge',
});

export const arbitrumGoerli = new BridgeBase(arbitrumGoerliConfig, goerliConfig, arbitrumGoerliGoerliConfig, {
  name: 'arbitrum-ethereum',
  category: 'helixLpBridge',
});
