import { PolkadotChainConfig } from '../../model';

export const pangoroConfig: PolkadotChainConfig = {
  isTest: true,
  logos: [
    { name: 'pangoro.png', type: 'main' },
    { name: 'pangoro.png', type: 'minor' },
  ],
  mode: 'native',
  name: 'pangoro',
  provider: 'wss://pangoro-rpc.darwinia.network',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangoro-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  ss58Prefix: 18,
  specVersion: 28110,
  tokens: [
    {
      name: 'ORING',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'pangolin', mode: 'dvm', role: 'receiver', symbol: 'xORING' },
        },
      ],
      type: 'native',
      logo: 'token-ring.svg',
      symbol: 'ORING',
      address: '',
    },
    {
      name: 'OKTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'pangolin', mode: 'dvm', role: 'receiver', symbol: 'xOKTON' },
        },
      ],
      type: 'native',
      logo: 'token-kton.svg',
      symbol: 'OKTON',
      address: '',
    },
  ],
  category: ['polkadot'],
};
