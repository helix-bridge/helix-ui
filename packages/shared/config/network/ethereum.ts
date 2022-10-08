import { EthereumChainConfig } from '../../model';

export const ethereumConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x1',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: [],
  },
  isTest: false,
  logos: [{ name: 'ethereum.png', type: 'main' }],
  name: 'ethereum',
  fullName: 'Ethereum',
  provider: 'https://mainnet.infura.io/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ethereum-org-website',
    twitter: 'https://twitter.com/ethdotorg',
  },
  // FIXME: Token order must be 0 for ring, 1 for kton;
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'darwinia', role: 'issuing', symbol: 'RING' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'xRING' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'RING' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-heco',
          partner: { name: 'heco', role: 'issuing', symbol: 'RING' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'ethereum',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x9469d013805bffb7d3debe5e7839237e535ec483',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'darwinia', role: 'issuing', symbol: 'KTON' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'ethereum',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '0x9f284e1337a815fe77d2ff4ae46544645b20c5ff',
    },
    {
      name: 'USDT',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'ethereum-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-bsc',
          partner: { name: 'bsc', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDT.e' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'ethereum',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'ethereum-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-bsc',
          partner: { name: 'bsc', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC.e' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'ethereum-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'ethereum',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    },
    {
      name: 'BUSD',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'ethereum-bsc',
          partner: { name: 'bsc', role: 'issuing', symbol: 'BUSD' },
        },
      ],
      type: 'mapping',
      host: 'ethereum',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
    },
  ],
  wallets: ['metamask'],
};
