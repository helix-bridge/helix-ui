import { DVMChainConfig } from '../../model';

export const darwiniaDVMConfig: DVMChainConfig = {
  ethereumChain: {
    blockExplorerUrls: ['https://darwinia.subscan.io/'],
    chainId: '0x2e',
    chainName: 'darwinia',
    nativeCurrency: {
      decimals: 18,
      symbol: 'RING',
    },
    rpcUrls: ['https://rpc.darwinia.network/'],
  },
  isTest: false,
  name: 'darwinia-dvm',
  logos: [
    { name: 'darwinia-dvm.svg', type: 'main' },
    { name: 'darwinia.svg', type: 'minor' },
    { name: 'darwinia-logo.svg', type: 'assist' },
  ],
  provider: 'https://rpc.darwinia.network',
  social: {
    portal: 'https://darwinia.network/',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'darwinia', role: 'backing', symbol: 'RING' },
        },
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'darwinia-dvm', role: 'issuing', symbol: 'WRING' },
        },
      ],
      type: 'native',
      host: 'darwinia-dvm',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'WRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'crab-dvm', role: 'issuing', symbol: 'xWRING' },
        },
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'darwinia-dvm', role: 'backing', symbol: 'RING' },
        },
      ],
      type: 'mapping',
      host: 'darwinia-dvm',
      logo: 'token-ring.svg',
      symbol: 'WRING',
      address: '0xE7578598Aac020abFB918f33A20faD5B71d670b4',
    },
  ],
  ss58Prefix: 18,
  specVersion: 1242,
  wallets: ['metamask'],
};
