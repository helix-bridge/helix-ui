import { EthereumChainConfig } from '../../model';

export const lineaConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xe708',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ETH',
    },
    rpcUrls: [],
  },
  isTest: false,
  logos: [{ name: 'linea.png', type: 'main' }],
  name: 'linea',
  fullName: 'Linea',
  provider: {
    https: 'https://rpc.linea.build',
    wss: 'wss://rpc.linea.build',
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
      host: 'linea',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'linea',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
    {
      name: 'ETH',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'linea',
      logo: 'token-ethereum.svg',
      symbol: 'ETH',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [],
      type: 'erc20',
      host: 'linea',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
