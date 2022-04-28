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
    { name: 'eth-logo.svg', type: 'main' },
    { name: 'ropsten.svg', type: 'minor' },
  ],
  isTest: true,
  mode: 'native',
  name: 'ropsten',
  provider: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ropsten',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'ETHER',
      decimals: 18,
      bridges: [
        {
          category: 'helix',
          name: 'ethereum-darwinia',
          partner: { name: 'pangolin', mode: 'native', role: 'receiver', symbol: 'PRING' },
        },
      ],
      type: 'native',
      logo: 'token-ethereum.svg',
      symbol: 'ETHER',
      address: '',
    },
  ],
  category: ['ethereum'],
};
