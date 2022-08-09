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
      address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [],
      type: 'mapping',
      host: 'avalanche',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    },
  ],
  wallets: ['metamask'],
};
