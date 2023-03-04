import { EthereumChainConfig } from '../../model';

export const goerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x5',
    chainName: 'Goerli test network',
    nativeCurrency: {
      decimals: 18,
      symbol: 'GoerliETH',
    },
    rpcUrls: [],
  },
  logos: [{ name: 'ropsten.png', type: 'main' }],
  isTest: true,
  name: 'goerli',
  fullName: 'Goerli',
  provider: {
    https: 'https://goerli.infura.io/v3/5350449ccd2349afa007061e62ee1409',
    wss: 'wss://goerli.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  },
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'GoerliETH',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'goerli',
      logo: 'token-ethereum.svg',
      symbol: 'GoerliETH',
      address: '',
    },
    {
      name: 'ORING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-ethereum',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'ORING' },
        },
        {
          category: 'helix',
          bridge: 'substrateDVM-ethereum',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'WORING' },
        },
      ],
      type: 'erc20',
      host: 'goerli',
      logo: 'token-ring.svg',
      symbol: 'ORING',
      address: '0x046D07d53926318d1F06c2c2A0F26a4de83E26c4',
    },
    {
      name: 'RING',
      decimals: 18,
      cross: [
        // {
        // category: 'helixLpBridge',
        // bridge: 'arbitrum-ethereum',
        // partner: { name: 'arbitrum-goerli', role: 'backing', symbol: 'RING' },
        // deprecated: true,
        // },
      ],
      type: 'erc20',
      host: 'goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x1836bafa3016dd5ce543d0f7199cb858ec69f41e',
    },
    {
      name: 'OKTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-ethereum',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'OKTON' },
        },
      ],
      type: 'erc20',
      host: 'goerli',
      logo: 'token-kton.svg',
      symbol: 'OKTON',
      address: '0xdd3df59c868fcd40fded7af0cccc3e2c7bcb4f3c',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
