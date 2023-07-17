import { ParachainChainConfig } from '../../model';

export const karuraConfig: ParachainChainConfig = {
  isTest: false,
  logos: [{ name: 'karura.svg', type: 'main' }],
  name: 'karura',
  fullName: 'Karura',
  provider: { https: 'https://karura-rpc.dwellir.com', wss: 'wss://karura.api.onfinality.io/public-ws' },
  social: {
    portal: 'https://acala.network/karura/join-karura',
    github: '',
    twitter: '',
  },
  tokens: [
    {
      name: 'KAR',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-shiden',
          partner: { name: 'shiden', role: 'issuing', symbol: 'KAR' },
          deprecated: true,
        },
        {
          category: 'XCM',
          bridge: 'karura-moonriver',
          partner: { name: 'moonriver', role: 'issuing', symbol: 'xcKAR' },
          deprecated: true,
        },
        {
          category: 'XCM',
          bridge: 'karura-khala',
          partner: { name: 'khala', role: 'issuing', symbol: 'KAR' },
          deprecated: true,
        },
      ],
      type: 'native',
      host: 'karura',
      logo: 'token-karura.svg',
      symbol: 'KAR',
      address: '',
    },
    {
      name: 'aUSD',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-shiden',
          partner: { name: 'shiden', role: 'issuing', symbol: 'aUSD' },
          deprecated: true,
        },
        {
          category: 'XCM',
          bridge: 'karura-moonriver',
          partner: { name: 'moonriver', role: 'issuing', symbol: 'xcAUSD' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-ausd.png',
      symbol: 'aUSD',
      address: 'KUSD', // NativeAssetId
      symbolAlias: ['KUSD'],
    },
    {
      name: 'CRAB',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'crabParachain-karura',
          partner: { name: 'crab-parachain', role: 'backing', symbol: 'CRAB' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '13', // ForeignAssetId
    },
    {
      name: 'SDN',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'shiden-karura',
          partner: { name: 'shiden', role: 'backing', symbol: 'SDN' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-sdn.png',
      symbol: 'SDN',
      address: '18', // ForeignAssetId
    },
    {
      name: 'MOVR',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'moonriver-karura',
          partner: { name: 'moonriver', role: 'backing', symbol: 'MOVR' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-movr.png',
      symbol: 'MOVR',
      address: '3', // ForeignAssetId
    },
    {
      name: 'PHA',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'khala-karura',
          partner: { name: 'khala', role: 'backing', symbol: 'PHA' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-pha.png',
      symbol: 'PHA',
      address: 'PHA', // NativeAssetId
    },
  ],
  ss58Prefix: 8,
  specVersion: 2100,
  paraId: 2000,
  wallets: ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'],
};
