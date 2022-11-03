import { EthereumChainConfig } from '../../model';

export const avalancheConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xa86a',
    chainName: 'Avalanche',
    nativeCurrency: {
      decimals: 18,
      symbol: 'AVAX',
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  },
  isTest: false,
  logos: [{ name: 'avalanche.png', type: 'main' }],
  name: 'avalanche',
  fullName: 'Avalanche',
  provider: { https: 'https://api.avax.network/ext/bc/C/rpc', wss: 'wss://api.avax.network/ext/bc/C/ws' },
  social: {
    portal: 'https://www.avax.network/',
    github: 'https://github.com/ava-labs',
    twitter: 'https://twitter.com/avalancheavax',
  },
  tokens: [
    {
      name: 'USDT.e',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-avalanche',
          partner: { name: 'bsc', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-avalanche',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-avalanche',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'erc20',
      host: 'avalanche',
      logo: 'token-usdt.svg',
      symbol: 'USDT.e',
      address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    },
    {
      name: 'USDC.e',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-avalanche',
          partner: { name: 'bsc', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-avalanche',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'astar-avalanche',
          partner: { name: 'astar', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-avalanche',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'erc20',
      host: 'avalanche',
      logo: 'token-usdc.svg',
      symbol: 'USDC.e',
      address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    },
  ],
  wallets: ['metamask'],
};
