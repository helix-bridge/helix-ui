import { PolkadotChainConfig } from '../../model';

export const crabConfig: PolkadotChainConfig = {
  isTest: false,
  logos: [
    { name: 'crab-circle.svg', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
  name: 'crab',
  provider: { https: 'https://crab-rpc.darwinia.network', wss: 'wss://crab-rpc.darwinia.network' },
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
          bridge: 'substrate-substrateParachain',
          partner: { name: 'crab-parachain', role: 'issuing', symbol: 'CRAB' },
          deprecated: true,
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
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'crab-dvm', role: 'issuing', symbol: 'WCKTON' },
        },
      ],
      type: 'native',
      host: 'crab',
      logo: 'token-ckton.svg',
      symbol: 'CKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 1250,
  wallets: ['polkadot', 'subwallet', 'talisman'],
};
