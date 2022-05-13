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
  mode: 'dvm',
  name: 'pangolin',
  provider: 'wss://pangolin-rpc.darwinia.network/',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangolin-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'PRING',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-DVM',
          partner: { name: 'pangolin', mode: 'native', role: 'issuer', symbol: 'PRING' },
        },
      ],
      type: 'native',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '0xc52287b259b2431ba0f61BC7EBD0eD793B0b7044',
    },
    {
      name: 'WPKTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-DVM',
          partner: { name: 'pangolin', mode: 'native', role: 'issuer', symbol: 'PKTON' },
        },
      ],
      type: 'native',
      logo: 'token-kton.svg',
      symbol: 'WPKTON',
      address: '0x8809f9b3ACEF1dA309f49b5Ab97A4C0faA64E6Ae',
    },
    {
      name: 'xORING',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'pangoro', mode: 'native', role: 'issuer', symbol: 'oRING' },
        },
      ],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'xORING',
      address: '0xb142658BD18c560D8ea74a31C07297CeCfeCF949',
    },
    {
      name: 'xOKTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'pangoro', mode: 'native', role: 'issuer', symbol: 'oKTON' },
        },
      ],
      type: 'mapping',
      logo: 'token-kton.svg',
      symbol: 'xOKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 28110,
  wallets: ['metamask'],
};
