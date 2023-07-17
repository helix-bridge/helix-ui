import { EthereumChainConfig } from '../../model';

export const astarConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x250',
    chainName: 'Astar',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ASTAR',
    },
    rpcUrls: ['https://astar.api.onfinality.io/public'],
  },
  isTest: false,
  logos: [{ name: 'astar.png', type: 'main' }],
  name: 'astar',
  fullName: 'Astar',
  provider: { https: 'https://astar-rpc.dwellir.com', wss: 'wss://astar.api.onfinality.io/public-ws' },
  social: {
    portal: 'https://astar.network/',
    github: 'https://github.com/AstarNetwork',
    twitter: 'https://twitter.com/astarNetwork',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'ethereum-astar',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDT' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-astar',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'USDT' },
          deprecated: true,
        },
      ],
      type: 'erc20',
      host: 'astar',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-astar',
          partner: { name: 'bsc', role: 'backing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'astar-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC.e' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'astar-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'polygon-astar',
          partner: { name: 'polygon', role: 'backing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-astar',
          partner: { name: 'ethereum', role: 'backing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-astar',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'USDC' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'arbitrum-astar',
          partner: { name: 'arbitrum', role: 'backing', symbol: 'USDC' },
          deprecated: true,
        },
      ],
      type: 'erc20',
      host: 'astar',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
    },
    {
      name: 'BUSD',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bsc-astar',
          partner: { name: 'bsc', role: 'backing', symbol: 'BUSD' },
          deprecated: true,
        },
      ],
      type: 'erc20',
      host: 'astar',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
