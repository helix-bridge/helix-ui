import { EthereumChainConfig } from '../../model';

export const astarConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x250',
    chainName: 'Astar',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://astar.api.onfinality.io/public'],
  },
  isTest: false,
  logos: [{ name: 'astar.png', type: 'main' }],
  name: 'astar',
  provider: 'wss://astar.api.onfinality.io/public-ws',
  social: {
    portal: 'https://astar.network/',
    github: 'https://github.com/AstarNetwork',
    twitter: 'https://twitter.com/astarNetwork',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'astar',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'astar',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '',
    },
    {
      name: 'busd',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'astar',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '',
    },
  ],
  wallets: ['metamask'],
};
