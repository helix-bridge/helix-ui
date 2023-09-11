import { EthereumChainConfig } from '../../model';

export const zksyncGoerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x118',
    chainName: 'zkSync Era Testnet',
    nativeCurrency: {
      decimals: 18,
      symbol: 'zkETH',
    },
    rpcUrls: ['https://testnet.era.zksync.dev'],
  },
  isTest: true,
  logos: [{ name: 'zksync.png', type: 'main' }],
  name: 'zksync-goerli',
  fullName: 'zkSync Era Testnet',
  // wss binary message
  provider: { https: 'https://testnet.era.zksync.dev', wss: 'wss://testnet.era.zksync.dev/ws' },
  social: {
    portal: 'https://zksync.io/',
    github: 'https://github.com/matter-labs',
    twitter: 'https://twitter.com/zksync',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'zksync-goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x61C31A1fA4a8D765e63D4285f368aA2f4d912DbB',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'zksync-goerli',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
    {
      name: 'zkETH',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'zksync-goerli',
      logo: 'token-ethereum.svg',
      symbol: 'zkETH',
      address: '0x0000000000000000000000000000000000000000',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [],
      type: 'erc20',
      host: 'zksync-goerli',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x0faF6df7054946141266420b43783387A78d82A9',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
