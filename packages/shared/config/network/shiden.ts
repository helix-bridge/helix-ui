import { PolkadotChainConfig } from '../../model';

export const shidenConfig: PolkadotChainConfig = {
  isTest: false,
  logos: [{ name: 'shiden.png', type: 'main' }],
  name: 'shiden',
  fullName: 'Shiden',
  provider: { https: 'https://shiden-rpc.dwellir.com/', wss: 'wss://shiden-rpc.dwellir.com/' },
  social: {
    portal: 'https://shiden.astar.network/',
    github: 'https://github.com/PlasmNetwork/Plasm',
    twitter: 'https://twitter.com/ShidenNetwork',
  },
  tokens: [
    {
      name: 'SDN',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'shiden-khala',
          partner: { name: 'khala', role: 'issuing', symbol: 'SDN' },
        },
      ],
      type: 'native',
      host: 'shiden',
      logo: 'token-sdn.png',
      symbol: 'SDN',
      address: '',
    },
    {
      name: 'PHA',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'khala-shiden',
          partner: { name: 'khala', role: 'backing', symbol: 'PHA' },
        },
      ],
      type: 'mapping',
      host: 'shiden',
      logo: 'token-pha.png',
      symbol: 'PHA',
      address: '',
    },
  ],
  specVersion: 79,
  ss58Prefix: 5,
  wallets: ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'],
};
