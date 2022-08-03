import { PolkadotChainConfig } from '../../model';

export const crabConfig: PolkadotChainConfig = {
  isTest: false,
  logos: [
    { name: 'crab.png', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
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
          partner: { name: 'crab-dvm', role: 'issuing', symbol: 'CRAB' },
        },
        {
          category: 'helix',
          bridge: 'parachain-substrate',
          partner: { name: 'crab-parachain', role: 'backing', symbol: 'CRAB' },
        },
      ],
      type: 'native',
      host: 'crab',
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
        //   partner: { name: 'crab', mode: 'dvm', role: 'issuing', symbol: 'WCKTON', claim: true },
        // },
      ],
      type: 'native',
      host: 'crab',
      logo: 'token-ckton.svg',
      symbol: 'CKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 1232,
  wallets: ['polkadot'],
};
