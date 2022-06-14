import { PolkadotChainConfig } from '../../model';

export const pangolinConfig: PolkadotChainConfig = {
  isTest: true,
  logos: [
    { name: 'pangolin.png', type: 'main' },
    { name: 'pangolin.svg', type: 'minor' },
    { name: 'pangolin-logo.svg', type: 'assist' },
  ],
  mode: 'native',
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
          partner: { name: 'pangolin', mode: 'dvm', role: 'receiver', symbol: 'PRING' },
        },
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ropsten', mode: 'native', role: 'issuer', symbol: 'PRING' },
        },
      ],
      type: 'native',
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
          partner: { name: 'pangolin', mode: 'dvm', role: 'receiver', symbol: 'WPKTON' },
        },
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ropsten', mode: 'native', role: 'issuer', symbol: 'PKTON' },
        },
      ],
      type: 'native',
      logo: 'token-kton.svg',
      symbol: 'PKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 28120,
  wallets: ['polkadot'],
};
