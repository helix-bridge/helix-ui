import { ParachainChainConfig } from '../../model';

export const karuraConfig: ParachainChainConfig = {
  isTest: false,
  logos: [{ name: 'karura.svg', type: 'main' }],
  name: 'karura',
  fullName: 'Karura',
  provider: 'wss://karura.api.onfinality.io/public-ws',
  social: {
    portal: 'https://acala.network/karura/join-karura',
    github: '',
    twitter: '',
  },
  tokens: [
    {
      name: 'KAR',
      decimals: 18,
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
      address: '13',
    },
  ],
  ss58Prefix: 8,
  specVersion: 2095,
  paraId: 2000,
  wallets: ['polkadot'],
};
