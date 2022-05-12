import { DVMChainConfig } from '../../model';

export const crabDVMConfig: DVMChainConfig = {
  ethereumChain: {
    blockExplorerUrls: ['https://crab.subscan.io/'],
    chainId: '44',
    chainName: 'crab',
    nativeCurrency: {
      decimals: 18,
      symbol: 'CRAB',
    },
    rpcUrls: ['https://crab-rpc.darwinia.network/'],
  },
  isTest: false,
  logos: [
    { name: 'crab-smart.png', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
  mode: 'dvm',
  name: 'crab',
  provider: 'wss://darwinia-crab.api.onfinality.io/public-ws',
  social: {
    portal: 'https://crab.network/',
    github: 'https://github.com/darwinia-network/darwinia/tree/main/runtime/crab',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'CRAB',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-DVM',
          partner: { name: 'crab', mode: 'native', role: 'issuer', symbol: 'CRAB' },
        },
      ],
      type: 'native',
      logo: 'token-wcrab.svg',
      symbol: 'CRAB',
      address: '',
    },
    {
      name: 'WCKTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-DVM',
          partner: { name: 'crab', mode: 'native', role: 'issuer', symbol: 'CKTON' },
        },
      ],
      type: 'native',
      logo: 'token-wckton.svg',
      symbol: 'WCKTON',
      address: '',
    },
    {
      name: 'xRING',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'darwinia', mode: 'native', role: 'issuer', symbol: 'RING' },
        },
      ],
      type: 'mapping',
      logo: 'token-oring.svg',
      symbol: 'xRING',
      address: '',
    },
    {
      name: 'xKTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'darwinia', mode: 'native', role: 'issuer', symbol: 'KTON' },
        },
      ],
      type: 'mapping',
      logo: 'token-okton.svg',
      symbol: 'xKTON',
      address: '',
    },
  ],
  category: ['dvm', 'polkadot', 'ethereum'],
  ss58Prefix: 42,
  specVersion: 1210,
};
