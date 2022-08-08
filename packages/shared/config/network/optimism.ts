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
      cross: [],
      type: 'mapping',
      host: 'optimism',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'optimism',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '',
    },
    {
      name: 'busd',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'optimism',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '',
    },
  ],
  wallets: ['metamask'],
};
