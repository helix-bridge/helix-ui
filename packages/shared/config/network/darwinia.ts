import { PolkadotChainConfig } from '../../model';

export const darwiniaConfig: PolkadotChainConfig = {
  isTest: false,
  name: 'darwinia',
  logos: [
    { name: 'darwinia.png', type: 'main', mode: 'native' },
    { name: 'darwinia.svg', type: 'minor', mode: 'native' },
    { name: 'darwinia-logo.svg', type: 'assist', mode: 'native' },
  ],
  endpoints: {
    mmr: 'https://api.subquery.network/sq/darwinia-network/darwinia-mmr',
  },
  provider: {
    etherscan: '',
    rpc: 'wss://rpc.darwinia.network',
  },
  social: {
    portal: 'https://darwinia.network/',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [{ name: 'RING', precision: 9, bridges: ['helix'], type: 'native', logo: 'ring.svg' }],
  ss58Prefix: 18,
  specVersion: 1180,
  type: ['polkadot', 'darwinia'],
};
