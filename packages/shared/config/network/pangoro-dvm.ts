import { DVMChainConfig } from '../../model';

export const pangoroDVMConfig: DVMChainConfig = {
  ethereumChain: {
    blockExplorerUrls: ['https://pangoro.subscan.io/'],
    chainId: '0x2d',
    chainName: 'pangoro',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ORING',
    },
    rpcUrls: ['https://pangoro-rpc.darwinia.network/'],
  },
  isTest: true,
  logos: [
    { name: 'pangoro.png', type: 'main' },
    { name: 'pangoro.png', type: 'minor' },
  ],
  name: 'pangoro-dvm',
  provider: 'wss://pangoro-rpc.darwinia.network',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangoro-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  ss58Prefix: 18,
  specVersion: 29030,
  tokens: [
    {
      name: 'ORING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'pangoro-dvm', role: 'issuing', symbol: 'WRING' },
        },
        {
          bridge: 'substrateDVM-ethereum',
          category: 'helix',
          partner: { name: 'goerli', role: 'issuing', symbol: 'RING' },
        },
      ],
      type: 'native',
      host: 'pangoro-dvm',
      logo: 'token-ring.svg',
      symbol: 'ORING',
      address: '0x69e392E057B5994da2b0E9661039970Ac4c26b8c',
    },
    {
      name: 'WRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'ORING' },
        },
      ],
      type: 'mapping',
      host: 'pangoro-dvm',
      logo: 'token-ring.svg',
      symbol: 'WRING',
      address: '0x69e392E057B5994da2b0E9661039970Ac4c26b8c',
    },
    {
      name: 'wORING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'pangolin-dvm', role: 'issuing', symbol: 'xWORING' },
        },
      ],
      type: 'mapping',
      host: 'pangoro-dvm',
      logo: 'token-ring.svg',
      symbol: 'wORING',
      address: '0x78f3B1ae818c304Bbec76e244B67dEdC70506006',
    },
  ],
  wallets: ['metamask'],
};
