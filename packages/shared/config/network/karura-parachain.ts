import { ParachainChainConfig } from '../../model';

export const karuraParachainConfig: ParachainChainConfig = {
  isTest: false,
  logos: [{ name: 'karura.svg', type: 'main' }],
  name: 'karura-parachain',
  provider: 'wss://karura.api.onfinality.io/public-ws',
  social: {
    portal: 'https://acala.network/karura/join-karura',
    github: '',
    twitter: '',
  },
  tokens: [
    {
      name: 'CRAB',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'crabParachain-karuraParachain',
          partner: { name: 'crab-parachain', role: 'backing', symbol: 'CRAB' },
        },
      ],
      type: 'mapping',
      host: 'karura-parachain',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '13',
    },
  ],
  ss58Prefix: 8,
  specVersion: 2091,
  paraId: 2000,
  wallets: ['polkadot'],
};
