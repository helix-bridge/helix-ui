import { PolkadotChainConfig } from '../../model';

export const pangolinParachainConfig: PolkadotChainConfig = {
  isTest: true,
  logos: [
    { name: 'pangolin.png', type: 'main' },
    { name: 'pangolin.svg', type: 'minor' },
    { name: 'pangolin-logo.svg', type: 'assist' },
  ],
  mode: 'native',
  name: 'pangolin-parachain',
  provider: 'wss://pangolin-rpc.darwinia.network/',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangolin-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'PRING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'parachain-substrate',
          partner: { name: 'pangolin', mode: 'native', role: 'receiver', symbol: 'PRING' },
        },
      ],
      type: 'native',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 5200,
  wallets: ['polkadot'],
};
