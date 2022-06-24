import { PolkadotChainConfig } from '../../model';

export const pangoroConfig: PolkadotChainConfig = {
  isTest: true,
  logos: [
    { name: 'pangoro.png', type: 'main' },
    { name: 'pangoro.png', type: 'minor' },
  ],
  name: 'pangoro',
  provider: 'wss://pangoro-rpc.darwinia.network',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangoro-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  ss58Prefix: 18,
  specVersion: 28130,
  tokens: [
    {
      name: 'ORING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'pangolin-dvm', role: 'receiver', symbol: 'xORING' },
        },
      ],
      type: 'native',
      host: 'pangoro',
      logo: 'token-ring.svg',
      symbol: 'ORING',
      address: '',
    },
  ],
  wallets: ['polkadot'],
};
