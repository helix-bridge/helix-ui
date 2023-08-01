import { EthereumChainConfig } from '../../model';

export const arbitrumConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ETH',
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  },
  isTest: false,
  logos: [{ name: 'arbitrum.png', type: 'main' }],
  name: 'arbitrum',
  fullName: 'Arbitrum One',
  // wss binary message
  provider: { https: 'https://arb1.arbitrum.io/rpc', wss: 'wss://arb1.arbitrum.io/feed' },
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
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDT.e' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDT' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDT' },
          deprecated: true,
        },
      ],
      type: 'erc20',
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
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC.e' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDC' },
          deprecated: true,
        },
      ],
      type: 'erc20',
      host: 'arbitrum',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    },
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'helixLpBridge',
          bridge: 'arbitrum-ethereum',
          partner: { name: 'ethereum', role: 'backing', symbol: 'RING' },
          basefee: 1300,
          price: 440000,
          index: 0,
          deprecated: true,
        },
        {
          category: 'lnbridgev20-opposite',
          bridge: 'arbitrum-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'RING' },
          basefee: 5000,
        },
      ],
      type: 'erc20',
      host: 'arbitrum',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x9e523234D36973f9e38642886197D023C88e307e',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
