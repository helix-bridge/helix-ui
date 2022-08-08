import { EthereumChainConfig } from '../../model';

export const arbitrumConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  },
  isTest: false,
  logos: [{ name: 'arbitrum.png', type: 'main' }],
  name: 'arbitrum',
  provider: 'wss://arbitrum.getblock.io/mainnet',
  social: {
    portal: 'https://arbitrum.io/',
    github: 'https://github.com/OffchainLabs',
    twitter: 'https://twitter.com/arbitrum',
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
