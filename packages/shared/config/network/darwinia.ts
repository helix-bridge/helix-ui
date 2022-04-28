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
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'crab', mode: 'dvm', role: 'receiver', symbol: 'xRING' },
        },
        {
          category: 'helix',
          name: 'ethereum-darwinia',
          partner: { name: 'ethereum', mode: 'native', role: 'issuer', symbol: 'ETHER' },
        },
      ],
      type: 'native',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'crab', mode: 'dvm', role: 'receiver', symbol: 'xKTON' },
        },
        {
          category: 'helix',
          name: 'ethereum-darwinia',
          partner: { name: 'ethereum', mode: 'native', role: 'issuer', symbol: 'ETHER' },
        },
      ],
      type: 'native',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
  ],
  ss58Prefix: 18,
  specVersion: 1180,
  category: ['polkadot'],
};
