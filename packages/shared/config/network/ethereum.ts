import { EthereumChainConfig } from '../../model';

export const ethereumConfig: EthereumChainConfig = {
  mode: 'native',
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
    { name: 'eth-logo.svg', type: 'main' },
    { name: 'ethereum.svg', type: 'minor' },
  ],
  name: 'ethereum',
  provider: 'wss://mainnet.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ethereum-org-website',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'ETHER',
      decimals: 18,
      bridges: [],
      type: 'native',
      logo: 'token-ethereum.svg',
      symbol: 'ETHER',
      address: '',
    },
    {
      name: 'RING',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'ethereum-darwinia',
          partner: { name: 'darwinia', mode: 'native', role: 'receiver', symbol: 'RING' },
        },
      ],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'ethereum-darwinia',
          partner: { name: 'darwinia', mode: 'native', role: 'receiver', symbol: 'KTON' },
        },
      ],
      type: 'mapping',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
  ],
  category: ['ethereum'],
};
