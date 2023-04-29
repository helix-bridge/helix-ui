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
  provider: { https: 'https://pangoro-rpc.darwinia.network', wss: 'wss://pangoro-rpc.darwinia.network' },
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
          bridge: 'darwiniaDVM-crabDVM',
          partner: { name: 'pangolin-dvm', role: 'issuing', symbol: 'xWORING' },
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
      name: 'OKTON',
      decimals: 18,
      cross: [
        {
          bridge: 'substrateDVM-ethereum',
          category: 'helix',
          partner: { name: 'goerli', role: 'issuing', symbol: 'OKTON', claim: true },
        },
      ],
      type: 'erc20',
      host: 'pangoro-dvm',
      logo: 'token-kton.svg',
      symbol: 'OKTON',
      address: '0x0000000000000000000000000000000000000402',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
