import { DVMChainConfig } from '../../model';

export const crabDVMConfig: DVMChainConfig = {
  ethereumChain: {
    blockExplorerUrls: ['https://crab.subscan.io/'],
    chainId: '0x2c',
    chainName: 'crab',
    nativeCurrency: {
      decimals: 18,
      symbol: 'CRAB',
    },
    rpcUrls: ['https://crab-rpc.darwinia.network/'],
  },
  isTest: false,
  logos: [
    { name: 'crab-smart.svg', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
  name: 'crab-dvm',
  provider: 'wss://crab-rpc.darwinia.network',
  social: {
    portal: 'https://crab.network/',
    github: 'https://github.com/darwinia-network/darwinia/tree/main/runtime/crab',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'CRAB',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'crab', role: 'backing', symbol: 'CRAB' },
        },
      ],
      type: 'native',
      host: 'crab-dvm',
      logo: 'token-wcrab.svg',
      symbol: 'CRAB',
      address: '0x588abe3F7EE935137102C5e2B8042788935f4CB0',
    },
    {
      name: 'CKTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'crab', role: 'backing', symbol: 'CKTON' },
        },
      ],
      type: 'erc20',
      host: 'crab-dvm',
      logo: 'token-wckton.svg',
      symbol: 'WCKTON',
      address: '0x0000000000000000000000000000000000000402',
    },
    {
      name: 'xRING(Classic)',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'darwinia', role: 'backing', symbol: 'RING' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-heco',
          partner: { name: 'heco', role: 'issuing', symbol: 'RING' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'RING' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'RING' },
          deprecated: true,
        },
      ],
      type: 'erc20',
      host: 'crab-dvm',
      logo: 'token-oring.svg',
      symbol: 'xRING',
      address: '0x7399Ea6C9d35124d893B8d9808930e9d3F211501',
    },
    {
      name: 'xKTON',
      decimals: 9,
      cross: [],
      type: 'erc20',
      host: 'crab-dvm',
      logo: 'token-okton.svg',
      symbol: 'xKTON',
      address: '',
    },
    {
      name: 'xWRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-substrateDVM',
          partner: { name: 'darwinia-dvm', role: 'backing', symbol: 'WRING' },
        },
      ],
      type: 'erc20',
      host: 'crab-dvm',
      logo: 'token-oring.svg',
      symbol: 'xWRING',
      address: '0x273131F7CB50ac002BDd08cA721988731F7e1092',
    },
    {
      name: 'USDT',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'erc20',
      host: 'crab-dvm',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'erc20',
      host: 'crab-dvm',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
    },
  ],
  ss58Prefix: 42,
  specVersion: 1241,
  wallets: ['metamask'],
};
