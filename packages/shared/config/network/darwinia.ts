import { PolkadotChainConfig } from '../../model';

export const darwiniaConfig: PolkadotChainConfig = {
  isTest: false,
  name: 'darwinia',
  logos: [
    { name: 'darwinia.png', type: 'main' },
    { name: 'darwinia.svg', type: 'minor' },
    { name: 'darwinia-logo.svg', type: 'assist' },
  ],
  endpoints: {
    mmr: 'https://api.subquery.network/sq/darwinia-network/darwinia-mmr',
  },
  provider: 'wss://rpc.darwinia.network',
  social: {
    portal: 'https://darwinia.network/',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 9,
      bridges: ['helix'],
      type: 'native',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 9,
      bridges: ['helix'],
      type: 'native',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
  ],
  ss58Prefix: 18,
  specVersion: 1180,
  type: ['polkadot'],
};
