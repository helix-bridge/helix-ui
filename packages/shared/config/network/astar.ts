import { EthereumChainConfig } from '../../model';

export const astarConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x250',
    chainName: 'Astar',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://astar.api.onfinality.io/public'],
  },
  isTest: false,
  logos: [{ name: 'astar.png', type: 'main' }],
  name: 'astar',
  provider: 'wss://astar.api.onfinality.io/public-ws',
  social: {
    portal: 'https://astar.network/',
    github: 'https://github.com/AstarNetwork',
    twitter: 'https://twitter.com/astarNetwork',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bnb-astar',
          partner: { name: 'BNB Chain', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-astar',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'astar-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'astar-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'astar',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bnb-astar',
          partner: { name: 'BNB Chain', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-astar',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'astar-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'astar-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'polygon-astar',
          partner: { name: 'polygon', role: 'backing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'astar',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
    },
    {
      name: 'busd',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'astar',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E',
    },
  ],
  wallets: ['metamask'],
};
