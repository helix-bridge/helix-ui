import { PolkadotChainConfig } from '../../model';

export const darwiniaConfig: PolkadotChainConfig = {
  isTest: false,
  name: 'darwinia',
  logos: [
    { name: 'darwinia-circle.svg', type: 'main' },
    { name: 'darwinia.svg', type: 'minor' },
    // { name: 'darwinia-logo.svg', type: 'assist' },
  ],
  provider: { https: 'https://rpc.darwinia.network', wss: 'wss://rpc.darwinia.network' },
  social: {
    portal: 'https://darwinia.network/',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'crab-dvm', role: 'issuing', symbol: 'xRING' },
          deprecated: true,
        },
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ethereum', role: 'backing', symbol: 'RING', claim: true },
          deprecated: true,
        },
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'darwinia-dvm', role: 'issuing', symbol: 'RING' },
        },
      ],
      type: 'native',
      host: 'darwinia',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x9469d013805bffb7d3debe5e7839237e535ec483',
    },
    {
      name: 'KTON',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ethereum', role: 'backing', symbol: 'KTON', claim: true },
          deprecated: true,
        },
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'darwinia-dvm', role: 'issuing', symbol: 'KTON' },
        },
      ],
      type: 'native',
      host: 'darwinia',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '0x9f284e1337a815fe77d2ff4ae46544645b20c5ff',
    },
  ],
  ss58Prefix: 18,
  specVersion: 1243,
  wallets: ['polkadot'],
};
