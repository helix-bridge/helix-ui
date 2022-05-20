import { PolkadotChainConfig } from '../../model';

export const darwiniaConfig: PolkadotChainConfig = {
  isTest: false,
  mode: 'native',
  name: 'darwinia',
  logos: [
    { name: 'darwinia.png', type: 'main' },
    { name: 'darwinia.svg', type: 'minor' },
    { name: 'darwinia-logo.svg', type: 'assist' },
  ],
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
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'crab', mode: 'dvm', role: 'receiver', symbol: 'xRING' },
        },
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ethereum', mode: 'native', role: 'issuer', symbol: 'RING' },
        },
      ],
      type: 'native',
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
          bridge: 'substrate-substrateDVM',
          partner: { name: 'crab', mode: 'dvm', role: 'receiver', symbol: 'xKTON' },
        },
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'ethereum', mode: 'native', role: 'issuer', symbol: 'KTON' },
        },
      ],
      type: 'native',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '0x9f284e1337a815fe77d2ff4ae46544645b20c5ff',
    },
  ],
  ss58Prefix: 18,
  specVersion: 1210,
  wallets: ['polkadot'],
};
