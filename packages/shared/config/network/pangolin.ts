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
    { name: 'PRING', decimals: 9, bridges: ['helix'], type: 'native', logo: 'token-ring.svg', symbol: '', address: '' },
    { name: 'PKTON', decimals: 9, bridges: ['helix'], type: 'native', logo: 'token-kton.svg', symbol: '', address: '' },
  ],
  ss58Prefix: 42,
  specVersion: 28060,
  category: ['polkadot'],
};
