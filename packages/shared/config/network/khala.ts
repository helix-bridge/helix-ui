import { ParachainChainConfig } from '../../model';

export const khalaConfig: ParachainChainConfig = {
  isTest: false,
  logos: [{ name: 'khala.svg', type: 'main' }],
  name: 'khala',
  fullName: 'Khala Network',
  provider: { https: 'https://khala-rpc.dwellir.com/', wss: 'wss://khala-rpc.dwellir.com/' },
  social: {
    portal: 'https://www.phala.network/en/khala',
    github: 'https://github.com/Phala-Network',
    twitter: 'https://twitter.com/PhalaNetwork',
  },
  tokens: [
    {
      name: 'PHA',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'khala-shiden',
          partner: { name: 'shiden', role: 'issuing', symbol: 'PHA' },
          deprecated: true,
        },
        {
          category: 'XCM',
          bridge: 'khala-karura',
          partner: { name: 'karura', role: 'issuing', symbol: 'PHA' },
          deprecated: true,
        },
        {
          category: 'XCM',
          bridge: 'khala-moonriver',
          partner: { name: 'moonriver', role: 'issuing', symbol: 'xcPHA' },
          deprecated: true,
        },
      ],
      type: 'native',
      host: 'khala',
      logo: 'token-pha.png',
      symbol: 'PHA',
      address: '',
    },
    {
      name: 'SDN',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'shiden-khala',
          partner: { name: 'shiden', role: 'backing', symbol: 'SDN' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'khala',
      logo: 'token-sdn.png',
      symbol: 'SDN',
      address: '12', // assets.metadata
    },
    {
      name: 'KAR',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-khala',
          partner: { name: 'karura', role: 'backing', symbol: 'KAR' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'khala',
      logo: 'token-karura.svg',
      symbol: 'KAR',
      address: '1',
      extra: { generalKey: '0x0080' },
    },
    {
      name: 'MOVR',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'moonriver-khala',
          partner: { name: 'moonriver', role: 'backing', symbol: 'MOVR' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'khala',
      logo: 'token-movr.png',
      symbol: 'MOVR',
      address: '6',
      extra: { palletInstance: 10 },
    },
  ],
  specVersion: 1192,
  ss58Prefix: 30,
  paraId: 2004,
  wallets: ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'],
};
