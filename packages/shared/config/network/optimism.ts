import { EthereumChainConfig } from '../../model';

export const optimismConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xa',
    chainName: 'Optimism',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io/'],
  },
  isTest: false,
  logos: [{ name: 'optimism.png', type: 'main' }],
  name: 'optimism',
  provider: 'wss://ws-mainnet.optimism.io',
  social: {
    portal: 'https://www.optimism.io/',
    github: 'https://github.com/ethereum-optimism',
    twitter: 'https://twitter.com/optimismFND',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bnb-optimism',
          partner: { name: 'BNB Chain', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-optimism',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'astar-optimism',
          partner: { name: 'astar', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-optimism',
          partner: { name: 'avalanche', role: 'backing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'optimism',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bnb-optimism',
          partner: { name: 'BNB Chain', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-optimism',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'astar-optimism',
          partner: { name: 'astar', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-optimism',
          partner: { name: 'avalanche', role: 'backing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'optimism',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
    },
  ],
  wallets: ['metamask'],
};
