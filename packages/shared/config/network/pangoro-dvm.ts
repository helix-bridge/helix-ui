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
  provider: 'https://pangoro-rpc.darwinia.network',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangoro-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  ss58Prefix: 18,
  specVersion: 210000,
  tokens: [
    {
      name: 'ORING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'pangoro-dvm', role: 'issuing', symbol: 'WORING' },
        },
        {
          bridge: 'substrateDVM-ethereum',
          category: 'helix',
          partner: { name: 'goerli', role: 'issuing', symbol: 'ORING', claim: true },
        },
      ],
      type: 'native',
      host: 'pangoro-dvm',
      logo: 'token-ring.svg',
      symbol: 'ORING',
      address: '',
    },
    {
      name: 'WORING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'ORING', claim: true },
        },
        {
          bridge: 'substrateDVM-ethereum',
          category: 'helix',
          partner: { name: 'goerli', role: 'issuing', symbol: 'ORING', claim: true },
        },
      ],
      type: 'mapping',
      host: 'pangoro-dvm',
      logo: 'token-ring.svg',
      symbol: 'WORING',
      address: '0x46f01081e800BF47e43e7bAa6D98d45F6a0251E4',
    },
    {
      name: 'OKTON',
      decimals: 18,
      cross: [
        {
          bridge: 'substrateDVM-ethereum',
          category: 'helix',
          partner: { name: 'goerli', role: 'issuing', symbol: 'OKTON', claim: true },
        },
      ],
      type: 'mapping',
      host: 'pangoro-dvm',
      logo: 'token-kton.svg',
      symbol: 'OKTON',
      address: '0x0000000000000000000000000000000000000402',
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
