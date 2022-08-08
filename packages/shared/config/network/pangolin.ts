import { PolkadotChainConfig } from '../../model';

export const pangolinConfig: PolkadotChainConfig = {
  isTest: true,
  logos: [
    { name: 'pangolin.png', type: 'main' },
    { name: 'pangolin.svg', type: 'minor' },
    { name: 'pangolin-logo.svg', type: 'assist' },
  ],
  name: 'pangolin',
  provider: 'wss://pangolin-rpc.darwinia.network',
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
          bridge: 'substrate-DVM',
          partner: { name: 'pangolin-dvm', role: 'issuing', symbol: 'PRING' },
        },
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ropsten', role: 'backing', symbol: 'PRING', claim: true },
        },
        {
          category: 'helix',
          bridge: 'parachain-substrate',
          partner: { name: 'pangolin-parachain', role: 'backing', symbol: 'PRING' },
        },
      ],
      type: 'native',
      host: 'pangolin',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '',
    },
    {
      name: 'PKTON',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'pangolin-dvm', role: 'issuing', symbol: 'WPKTON' },
        },
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ropsten', role: 'backing', symbol: 'PKTON', claim: true },
        },
      ],
      type: 'native',
      host: 'pangolin',
      logo: 'token-kton.svg',
      symbol: 'PKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 28180,
  wallets: ['polkadot'],
};
