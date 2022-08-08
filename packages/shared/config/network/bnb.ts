import { EthereumChainConfig } from '../../model';

export const bnbChainConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x38',
    chainName: 'BNB Chain',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://github.com/bnb-chain'],
  },
  isTest: false,
  logos: [{ name: 'bnb.png', type: 'main' }],
  name: 'BNB Chain',
  provider: 'wss://dex.binance.org/api/ws',
  social: {
    portal: 'https://www.bnbchain.org/',
    github: 'https://github.com/bnb-chain',
    twitter: 'https://twitter.com/BNBChain',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'BNB Chain',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'BNB Chain',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '',
    },
    {
      name: 'busd',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'BNB Chain',
      logo: 'token-busd.png',
      symbol: 'BUSD',
      address: '',
    },
  ],
  wallets: ['metamask'],
};
