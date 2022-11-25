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
      cross: [],
      type: 'native',
      host: 'karura',
      logo: 'token-karura.svg',
      symbol: 'KAR',
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
  ],
  ss58Prefix: 8,
  specVersion: 2100,
  paraId: 2000,
  wallets: ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'],
};
