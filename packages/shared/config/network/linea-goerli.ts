import { EthereumChainConfig } from 'model';

export const lineaGoerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xe704',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ETH',
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
      name: 'ETH',
      decimals: 18,
      cross: [
        {
          category: 'lnbridgev20-opposite',
          bridge: 'linea-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'GoerliETH' },
        },
      ],
      type: 'native',
      host: 'linea-goerli',
      logo: 'token-ethereum.svg',
      symbol: 'ETH',
      address: '',
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
      ],
      type: 'erc20',
      host: 'linea-goerli',
      logo: 'token-usdt.svg',
      symbol: 'USDC',
      address: '0xB4257F31750961C8e536f5cfCBb3079437700416',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
