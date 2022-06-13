import { PolkadotChainConfig } from '../../model';

export const crabParachainConfig: PolkadotChainConfig = {
  isTest: false,
  logos: [
    { name: 'crab.png', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
  mode: 'native',
  name: 'crab-parachain',
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
          bridge: 'parachain-substrate',
          partner: { name: 'crab', mode: 'native', role: 'receiver', symbol: 'CRAB' },
        },
      ],
      type: 'native',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 5210,
  wallets: ['polkadot'],
};
