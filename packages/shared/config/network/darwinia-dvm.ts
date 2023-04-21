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
  provider: { https: 'https://rpc.darwinia.network', wss: 'wss://rpc.darwinia.network' },
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
        /*
        {
          category: 'helixLpBridge',
          bridge: 'crab-darwinia',
          partner: { name: 'crab-dvm', role: 'issuing', symbol: 'xWRING' },
          basefee: 1.1,
        },
        */
        {
          category: 'helix',
          bridge: 'darwiniaDVM-crabDVM',
          partner: { name: 'crab-dvm', role: 'issuing', symbol: 'xWRING' },
          deprecated: true,
        },
        {
          category: 'helix',
          bridge: 'substrateDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'RING' },
          deprecated: true,
        },
        {
          category: 'helixLpBridge',
          bridge: 'darwinia-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'RING' },
          basefee: 1000,
          index: 0,
          price: 320000,
          deprecated: true,
        },
      ],
      type: 'native',
      host: 'darwinia-dvm',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
      deprecated: true,
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'KTON', claim: true },
          deprecated: true,
        },
      ],
      type: 'erc20',
      host: 'darwinia-dvm',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '0x0000000000000000000000000000000000000402',
      deprecated: true,
    },
    {
      name: 'xWCRAB',
      cross: [
        /*
        {
          category: 'helixLpBridge',
          bridge: 'crab-darwinia',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'WCRAB' },
          basefee: 1.1,
          index: 0,
        },
        {
          category: 'helixLpBridge',
          bridge: 'crab-darwinia',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'CRAB' },
          basefee: 1.1,
          index: 0,
        },
        */
        {
          category: 'helix',
          bridge: 'crabDVM-darwiniaDVM',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'CRAB' },
          deprecated: true,
        },
      ],
      decimals: 18,
      type: 'erc20',
      host: 'darwinia-dvm',
      logo: 'token-crab.svg',
      symbol: 'xWCRAB',
      address: '0x656567Eb75b765FC320783cc6EDd86bD854b2305',
      deprecated: true,
    },
  ],
  ss58Prefix: 18,
  specVersion: 1250,
  wallets: ['metamask', 'mathwallet-ethereum'],
};
