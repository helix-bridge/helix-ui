import { ParachainChainConfig } from '../../model';

export const shidenConfig: ParachainChainConfig = {
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
        {
          category: 'XCM',
          bridge: 'shiden-karura',
          partner: { name: 'karura', role: 'issuing', symbol: 'SDN' },
        },
        {
          category: 'XCM',
          bridge: 'shiden-moonriver',
          partner: { name: 'moonriver', role: 'issuing', symbol: 'xcSDN' },
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
      decimals: 12,
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
      address: '18446744073709551623',
    },
    {
      name: 'KAR',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-shiden',
          partner: { name: 'karura', role: 'backing', symbol: 'KAR' },
        },
      ],
      type: 'mapping',
      host: 'shiden',
      logo: 'token-karura.svg',
      symbol: 'KAR',
      address: '18446744073709551618',
      extra: { generalKey: '0x0080' },
    },
    {
      name: 'KUSD',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-shiden',
          partner: { name: 'karura', role: 'backing', symbol: 'KUSD' },
        },
      ],
      type: 'mapping',
      host: 'shiden',
      logo: 'token-ausd.png',
      symbol: 'KUSD',
      address: '18446744073709551616',
      extra: { generalKey: '0x0081' },
    },
  ],
  specVersion: 79,
  ss58Prefix: 5,
  paraId: 2007,
  wallets: ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'],
};
