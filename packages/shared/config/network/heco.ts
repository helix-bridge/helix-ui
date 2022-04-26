import { EthereumChainConfig } from '../../model';

export const hecoConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '128',
    chainName: 'heco-mainnet',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://http-mainnet.hecochain.com'],
  },
  isTest: true,
  logos: [{ name: 'heco.png', type: 'main', mode: 'native' }],
  name: 'heco',
  provider: {
    etherscan: 'https://http-mainnet.hecochain.com',
    rpc: '',
  },
  social: {
    portal: 'https://www.hecochain.com/en-us/',
    github: 'https://github.com/stars-labs/',
    twitter: 'https://twitter.com/HECO_Chain',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      bridges: ['helix'],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
  ],
  type: ['ethereum'],
};
