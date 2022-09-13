import { EthereumChainConfig } from '../../model';

export const hecoConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x80',
    chainName: 'heco-mainnet',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://http-mainnet.hecochain.com'],
  },
  isTest: false,
  logos: [{ name: 'heco-circle.svg', type: 'main' }],
  name: 'heco',
  fullName: 'Heco',
  provider: 'wss://ws-mainnet.hecochain.com',
  social: {
    portal: 'https://www.hecochain.com/en-us/',
    github: 'https://github.com/stars-labs/',
    twitter: 'https://twitter.com/HECO_Chain',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-heco',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'xRING' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-heco',
          partner: { name: 'ethereum', role: 'backing', symbol: 'RING' },
        },
        {
          category: 'cBridge',
          bridge: 'heco-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'RING' },
        },
      ],
      type: 'mapping',
      logo: 'token-ring.svg',
      host: 'heco',
      symbol: 'RING',
      address: '0x15e65456310ecb216B51EfBd8a1dBf753353DcF9',
    },
  ],
  wallets: ['metamask'],
};
