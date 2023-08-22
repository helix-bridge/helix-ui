import { EthereumChainConfig } from '../../model';

export const zksyncConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x144',
    chainName: 'zkSync Era Mainnet',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ETH',
    },
    rpcUrls: ['https://mainnet.era.zksync.io'],
  },
  isTest: true,
  logos: [{ name: 'zksync.png', type: 'main' }],
  name: 'zksync',
  fullName: 'zkSync Era Mainnet',
  // wss binary message
  provider: { https: 'https://mainnet.era.zksync.io', wss: 'wss://mainnet.era.zksync.io/ws' },
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
      host: 'zksync',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'zksync',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
    {
      name: 'ETH',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'zksync',
      logo: 'token-ethereum.svg',
      symbol: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
