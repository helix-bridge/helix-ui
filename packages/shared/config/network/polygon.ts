import { EthereumChainConfig } from '../../model';

export const polygonConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
  },
  isTest: false,
  logos: [
    { name: 'polygon.png', type: 'main' },
    { name: 'polygon2.png', type: 'assist' },
  ],
  name: 'polygon',
  fullName: 'Polygon(Matic)',
  provider: 'wss://ws-mainnet.matic.network',
  social: {
    portal: 'https://polygon.technology/',
    github: 'https://github.com/maticnetwork/',
    twitter: 'https://twitter.com/0xPolygon',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-polygon',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'xRING' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-polygon',
          partner: { name: 'ethereum', role: 'backing', symbol: 'RING' },
        },
        {
          category: 'cBridge',
          bridge: 'heco-polygon',
          partner: { name: 'heco', role: 'backing', symbol: 'RING' },
        },
      ],
      type: 'mapping',
      host: 'polygon',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f',
    },
    {
      name: 'USDT',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'ethereum-polygon',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-polygon',
          partner: { name: 'bsc', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-polygon',
          partner: { name: 'avalanche', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-polygon',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'polygon-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'polygon',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'polygon-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-polygon',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'bsc-polygon',
          partner: { name: 'bsc', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'avalanche-polygon',
          partner: { name: 'avalanche', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-polygon',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'polygon-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'polygon',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
    // { name: 'MATIC', decimals: 18, cross: [], type: 'native', host: 'polygon', logo: '', symbol: 'MATIC', address: '' },
  ],
  wallets: ['metamask'],
};
