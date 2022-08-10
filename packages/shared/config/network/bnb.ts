import { EthereumChainConfig } from '../../model';

export const bnbConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x38',
    chainName: 'BNB Chain',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://github.com/bnb-chain'],
  },
  isTest: false,
  logos: [{ name: 'bnb.png', type: 'main' }],
  name: 'BNB Chain',
  provider: 'wss://dex.binance.org/api/ws',
  social: {
    portal: 'https://www.bnbchain.org/',
    github: 'https://github.com/bnb-chain',
    twitter: 'https://twitter.com/BNBChain',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bnb-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'bnb-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'bnb-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'BNB Chain',
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
          bridge: 'bnb-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'bnb-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'bnb-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'BNB Chain',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
    {
      name: 'BUSD',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'BNB Chain',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    },
  ],
  wallets: ['metamask'],
};
