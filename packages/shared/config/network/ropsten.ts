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
  logos: [
    { name: 'eth-logo.svg', type: 'main', mode: 'native' },
    { name: 'ropsten.svg', type: 'minor', mode: 'native' },
  ],
  isTest: true,
  name: 'ropsten',
  provider: {
    etherscan: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
    rpc: '',
  },
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ropsten',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'ETHER',
      decimals: 18,
      bridges: ['helix'],
      type: 'native',
      logo: 'token-ethereum.svg',
      symbol: 'ETHER',
      address: '',
    },
  ],
  type: ['ethereum'],
};
