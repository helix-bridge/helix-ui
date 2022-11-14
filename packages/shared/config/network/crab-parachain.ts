import { ParachainChainConfig } from '../../model';

export const crabParachainConfig: ParachainChainConfig = {
  isTest: false,
  logos: [
    { name: 'crab-parachain.svg', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
  name: 'crab-parachain',
  provider: { https: 'https://crab-parachain-rpc.darwinia.network', wss: 'wss://crab-parachain-rpc.darwinia.network' },
  social: {
    portal: 'https://crab.network/',
    github: 'https://github.com/darwinia-network/darwinia/tree/main/runtime/crab',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'CRAB',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateParachain',
          partner: { name: 'crab', role: 'backing', symbol: 'CRAB' },
          deprecated: true,
        },
        {
          category: 'XCM',
          bridge: 'crabParachain-karura',
          partner: { name: 'karura', role: 'issuing', symbol: 'CRAB' },
        },
        {
          category: 'XCM',
          bridge: 'crabParachain-moonriver',
          partner: { name: 'moonriver', role: 'issuing', symbol: 'CRAB' },
        },
      ],
      type: 'mapping',
      host: 'crab-parachain',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 5350,
  paraId: 2105,
  wallets: ['polkadot'],
};
