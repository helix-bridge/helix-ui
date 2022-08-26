import { EthereumChainConfig } from '../../model';

export const arbitrumConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  },
  isTest: false,
  logos: [{ name: 'arbitrum.png', type: 'main' }],
  name: 'arbitrum',
  fullName: 'Arbitrum One',
  // provider: 'wss://arb1.arbitrum.io/feed', // binary message
  provider: 'https://arb1.arbitrum.io/rpc',
  social: {
    portal: 'https://arbitrum.io/',
    github: 'https://github.com/OffchainLabs',
    twitter: 'https://twitter.com/arbitrum',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-arbitrum',
          partner: { name: 'bsc', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'arbitrum',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-arbitrum',
          partner: { name: 'bsc', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'arbitrum',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    },
  ],
  wallets: ['metamask'],
};
