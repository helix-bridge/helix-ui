import { EthereumChainConfig } from '../../model';

export const arbitrumGoerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x66eed',
    chainName: 'ArbitrumGoerli',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ETH',
    },
    rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
  },
  isTest: true,
  logos: [{ name: 'arbitrum.png', type: 'main' }],
  name: 'arbitrum-goerli',
  fullName: 'Arbitrum Goerli',
  // wss binary message
  provider: { https: 'https://goerli-rollup.arbitrum.io/rpc', wss: 'wss://arb1.arbitrum.io/feed' },
  social: {
    portal: 'https://arbitrum.io/',
    github: 'https://github.com/OffchainLabs',
    twitter: 'https://twitter.com/arbitrum',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'arbitrum-goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0xfbad806bdf9cec2943be281fb355da05068de925',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'arbitrum-goerli',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
    {
      name: 'ETH',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'arbitrum-goerli',
      logo: 'token-ethereum.svg',
      symbol: 'ETH',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'lnbridgev20-default',
          bridge: 'arbitrum-linea',
          partner: { name: 'linea-goerli', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'arbitrum-mantle',
          partner: { name: 'mantle-goerli', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'erc20',
      host: 'arbitrum-goerli',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x39dE82E1d9B8F62E11022FC3FC127a82F93fE47E',
    },
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'lnbridgev20-default',
          bridge: 'arbitrum-linea',
          partner: { name: 'linea-goerli', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'arbitrum-mantle',
          partner: { name: 'mantle-goerli', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'erc20',
      host: 'arbitrum-goerli',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x6d828718c1097A4C573bc25c638Cc05bF10dFeAF',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
