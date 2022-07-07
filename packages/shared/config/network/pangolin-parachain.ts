import { PolkadotChainConfig } from '../../model';

export const pangolinParachainConfig: PolkadotChainConfig = {
  isTest: true,
  logos: [
    { name: 'pangolin.png', type: 'main' },
    { name: 'pangolin.svg', type: 'minor' },
    { name: 'pangolin-logo.svg', type: 'assist' },
  ],
  name: 'pangolin-parachain',
  provider: 'wss://pangolin-parachain-rpc.darwinia.network',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangolin-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'PRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'parachain-substrate',
          partner: { name: 'pangolin', role: 'receiver', symbol: 'PRING' },
        },
      ],
      type: 'native',
      host: 'pangolin-parachain',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 5220,
  wallets: ['polkadot'],
};
