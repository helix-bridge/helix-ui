import { EthereumChainConfig } from '../../model';

export const ropstenConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '3',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: [],
  },
  facade: {
    logo: '/image/eth-logo.svg',
    logoMinor: '/image/ropsten.svg',
    logoWithText: '',
  },
  isTest: true,
  name: 'ropsten',
  provider: {
    etherscan: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
    rpc: '',
  },
  type: ['ethereum'],
};
