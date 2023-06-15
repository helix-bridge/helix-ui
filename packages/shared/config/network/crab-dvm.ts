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
    { name: 'crab.svg', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab.svg', type: 'assist' },
  ],
  name: 'crab-dvm',
  provider: { https: 'https://crab-rpc.darwinia.network', wss: 'wss://crab-rpc.darwinia.network' },
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
        /*
        {
          category: 'helixLpBridge',
          bridge: 'crab-darwinia',
          partner: { name: 'darwinia-dvm', role: 'issuing', symbol: 'xWCRAB' },
          basefee: 1.1,
        },
        */
        {
          category: 'helix',
          bridge: 'crabDVM-darwiniaDVM',
          partner: { name: 'darwinia-dvm', role: 'issuing', symbol: 'xWCRAB' },
        },
      ],
      type: 'native',
      host: 'crab-dvm',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '0x2D2b97EA380b0185e9fDF8271d1AFB5d2Bf18329',
    },
    {
      name: 'xWRING',
      decimals: 18,
      cross: [
        /*
        {
          category: 'helixLpBridge',
          bridge: 'crab-darwinia',
          partner: { name: 'darwinia-dvm', role: 'backing', symbol: 'WRING' },
          basefee: 1.1,
          index: 1,
        },
        {
          category: 'helixLpBridge',
          bridge: 'crab-darwinia',
          partner: { name: 'darwinia-dvm', role: 'backing', symbol: 'RING' },
          basefee: 1.1,
          index: 1,
        },
        */
        {
          category: 'helix',
          bridge: 'darwiniaDVM-crabDVM',
          partner: { name: 'darwinia-dvm', role: 'backing', symbol: 'RING' },
        },
      ],
      type: 'erc20',
      host: 'crab-dvm',
      logo: 'token-oring.svg',
      symbol: 'xWRING',
      address: '0x273131F7CB50ac002BDd08cA721988731F7e1092',
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
      name: 'USDT',
      decimals: 6,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-astar',
          partner: { name: 'astar', role: 'issuing', symbol: 'USDT' },
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'USDT' },
          deprecated: true,
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
          deprecated: true,
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'USDC' },
          deprecated: true,
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
  specVersion: 6310,
  wallets: ['metamask', 'mathwallet-ethereum'],
};
