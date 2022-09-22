import { EthereumChainConfig } from '../../model';

export const bscConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x38',
    chainName: 'bsc',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://github.com/bsc-chain'],
  },
  isTest: false,
  logos: [{ name: 'bsc.png', type: 'main' }],
  name: 'bsc',
  fullName: 'BNB Chain',
  provider: 'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
  social: {
    portal: 'https://www.bnbchain.org/',
    github: 'https://github.com/bsc-chain',
    twitter: 'https://twitter.com/BNBChain',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDT.e' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-bsc',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'bsc',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x55d398326f99059fF775485246999027B3197955',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC.e' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-bsc',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'bsc',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
    {
      name: 'BUSD',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'ethereum-bsc',
          partner: { name: 'ethereum', role: 'backing', symbol: 'BUSD' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'BUSD' },
        },
      ],
      type: 'mapping',
      host: 'bsc',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    },
  ],
  wallets: ['metamask'],
};
