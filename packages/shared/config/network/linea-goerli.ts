import { EthereumChainConfig } from '../../model';

export const lineaGoerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xe704',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
      symbol: 'lineaETH',
    },
    rpcUrls: [],
  },
  isTest: true,
  logos: [{ name: 'linea.png', type: 'main' }],
  name: 'linea-goerli',
  fullName: 'Linea Goerli',
  provider: {
    https: 'https://rpc.goerli.linea.build',
    wss: 'wss://rpc.goerli.linea.build',
  },
  social: {
    portal: 'https://linea.build/',
    github: 'https://github.com/Consensys',
    twitter: 'https://twitter.com/LineaBuild',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'linea-goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'linea-goerli',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
    {
      name: 'lineaETH',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'linea-goerli',
      logo: 'token-ethereum.svg',
      symbol: 'lineaETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'lnbridgev20-opposite',
          bridge: 'linea-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'linea-arbitrum',
          partner: { name: 'arbitrum-goerli', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'linea-mantle',
          partner: { name: 'mantle-goerli', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'erc20',
      host: 'linea-goerli',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0xb5E028f980dF5533cB0e8F04530B76637383d993',
    },
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'lnbridgev20-opposite',
          bridge: 'linea-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'linea-arbitrum',
          partner: { name: 'arbitrum-goerli', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'linea-mantle',
          partner: { name: 'mantle-goerli', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'erc20',
      host: 'linea-goerli',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0xBC1A2f123Dc9CD2ec8d3cE42eF16c28F3C9bA686',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
