import { EthereumChainConfig } from '../../model';

export const avalancheConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xa86a',
    chainName: 'Avalanche',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  },
  isTest: false,
  logos: [{ name: 'avalanche.png', type: 'main' }],
  name: 'avalanche',
  provider: 'wss://api.avax.network/ext/bc/C/ws',
  social: {
    portal: 'https://www.avax.network/',
    github: 'https://github.com/ava-labs',
    twitter: 'https://twitter.com/avalancheavax',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'avalanche',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'avalanche',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '',
    },
    {
      name: 'busd',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'avalanche',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '',
    },
  ],
  wallets: ['metamask'],
};
