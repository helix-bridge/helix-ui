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
          category: 'XCM',
          bridge: 'crabParachain-karura',
          partner: { name: 'karura', role: 'issuing', symbol: 'CRAB' },
          deprecated: true,
        },
        {
          category: 'XCM',
          bridge: 'crabParachain-moonriver',
          partner: { name: 'moonriver', role: 'issuing', symbol: 'xcCRAB' },
          deprecated: true,
        },
      ],
      type: 'mapping',
      host: 'crab-parachain',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '',
      extra: { palletInstance: 5 },
    },
  ],
  ss58Prefix: 42,
  specVersion: 5350,
  paraId: 2105,
  wallets: ['polkadot', 'subwallet', 'talisman', 'mathwallet-polkadot'],
};
