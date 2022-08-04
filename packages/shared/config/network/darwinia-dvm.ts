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
    rpcUrls: ['https://darwinia-rpc.darwinia.network/'],
  },
  isTest: false,
  name: 'darwinia-dvm',
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
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'darwinia',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'wRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'crab-dvm', role: 'issuing', symbol: 'xWRING' },
        },
      ],
      type: 'native',
      host: 'darwinia',
      logo: 'token-ring.svg',
      symbol: 'wRING',
      address: '0x16D8A045F0B61786810DB5d4C2035932f8A3341A',
    },
  ],
  ss58Prefix: 18,
  specVersion: 1230,
  wallets: ['metamask'],
};
