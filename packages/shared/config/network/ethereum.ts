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
  isTest: false,
  logos: [
    { name: 'eth-logo.svg', type: 'main', mode: 'native' },
    { name: 'ethereum.svg', type: 'minor', mode: 'native' },
  ],
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
