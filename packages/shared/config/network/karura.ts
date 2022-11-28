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
        },
      ],
      type: 'native',
      host: 'karura',
      logo: 'token-karura.svg',
      symbol: 'KAR',
      address: '',
    },
    {
      name: 'AUSD',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-shiden',
          partner: { name: 'shiden', role: 'issuing', symbol: 'aUSD' },
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-ausd.png',
      symbol: 'aUSD',
      address: '',
    },
    {
      name: 'CRAB',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'crabParachain-karura',
          partner: { name: 'crab-parachain', role: 'backing', symbol: 'CRAB' },
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '13', // foreign asset id: assetRegistry.assetMetadatas
    },
    {
      name: 'SDN',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'shiden-karura',
          partner: { name: 'shiden', role: 'backing', symbol: 'SDN' },
        },
      ],
      type: 'mapping',
      host: 'karura',
      logo: 'token-sdn.png',
      symbol: 'SDN',
      address: '18',
    },
  ],
  ss58Prefix: 8,
  specVersion: 2100,
  paraId: 2000,
  wallets: ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'],
};
