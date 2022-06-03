import { PolkadotChainConfig } from '../../model';

export const crabConfig: PolkadotChainConfig = {
  isTest: false,
  logos: [
    { name: 'crab.png', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
  mode: 'native',
  name: 'crab',
  provider: 'wss://darwinia-crab.api.onfinality.io/public-ws',
  social: {
    portal: 'https://crab.network/',
    github: 'https://github.com/darwinia-network/darwinia/tree/main/runtime/crab',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'CRAB',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'crab', mode: 'dvm', role: 'receiver', symbol: 'CRAB' },
        },
      ],
      type: 'native',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '',
    },
    {
      name: 'CKTON',
      decimals: 9,
      cross: [
        // {
        //   category: 'helix',
        //   bridge: 'substrate-DVM',
        //   partner: { name: 'crab', mode: 'dvm', role: 'receiver', symbol: 'WCKTON' },
        // },
      ],
      type: 'native',
      logo: 'token-ckton.svg',
      symbol: 'CKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 1224,
  wallets: ['polkadot'],
};
