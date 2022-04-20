import { EthereumChainConfig } from '../../model';

export const ethereumConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '1',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: [],
  },
  facade: {
    logo: '/image/eth-logo.svg',
    logoMinor: '/image/ethereum.svg',
    logoWithText: '',
  },
  isTest: false,
  name: 'ethereum',
  provider: {
    etherscan: 'wss://mainnet.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
    rpc: '',
  },
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ethereum-org-website',
    twitter: 'https://twitter.com/ethdotorg',
  },
  type: ['ethereum'],
};
