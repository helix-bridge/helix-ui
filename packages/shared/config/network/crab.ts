import { PolkadotChainConfig } from '../../model';

export const crabConfig: PolkadotChainConfig = {
  endpoints: { mmr: '' },
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
    { name: 'CRAB', decimals: 9, bridges: ['helix'], type: 'native', logo: 'token-crab.svg', symbol: '', address: '' },
    {
      name: 'CKTON',
      decimals: 9,
      bridges: ['helix'],
      type: 'native',
      logo: 'token-ckton.svg',
      symbol: 'CKTON',
      address: '',
    },
  ],
  type: ['polkadot', 'darwinia'],
  ss58Prefix: 42,
  specVersion: 1200,
};
