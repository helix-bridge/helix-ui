import { DVMChainConfig } from '../../model';

export const pangolinDVMConfig: DVMChainConfig = {
  ethereumChain: {
    blockExplorerUrls: ['https://pangolin.subscan.io/'],
    chainId: '0x2b',
    chainName: 'pangolin',
    nativeCurrency: {
      decimals: 18,
      symbol: 'PRING',
    },
    rpcUrls: ['https://pangolin-rpc.darwinia.network/'],
  },
  isTest: true,
  logos: [
    { name: 'pangolin-smart.png', type: 'main' },
    { name: 'pangolin-2.png', type: 'minor' },
    { name: 'pangolin-logo.svg', type: 'assist' },
  ],
  name: 'pangolin-dvm',
  provider: 'wss://pangolin-rpc.darwinia.network',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangolin-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'PRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'pangolin', role: 'backing', symbol: 'PRING' },
        },
      ],
      type: 'native',
      host: 'pangolin-dvm',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '0xc52287b259b2431ba0f61BC7EBD0eD793B0b7044',
    },
    {
      name: 'WPKTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'pangolin', role: 'backing', symbol: 'PKTON' },
        },
      ],
      type: 'native',
      host: 'pangolin-dvm',
      logo: 'token-kton.svg',
      symbol: 'WPKTON',
      address: '0x0000000000000000000000000000000000000402',
    },
    {
      name: 'xORING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'pangoro', role: 'backing', symbol: 'ORING' },
        },
      ],
      type: 'mapping',
      host: 'pangolin-dvm',
      logo: 'token-ring.svg',
      symbol: 'xORING',
      address: '0xb142658BD18c560D8ea74a31C07297CeCfeCF949',
    },
    {
      name: 'xWORING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'wORING' },
        },
      ],
      type: 'mapping',
      host: 'pangolin-dvm',
      logo: 'token-ring.svg',
      symbol: 'xWORING',
      address: '0xba01cfcad99c17dad9a859bd881dc99851faecf5',
    },
  ],
  ss58Prefix: 42,
  specVersion: 29020,
  wallets: ['metamask'],
};
