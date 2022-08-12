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
    { name: 'crab-smart.png', type: 'main' },
    { name: 'crab.svg', type: 'minor' },
    { name: 'crab-logo.svg', type: 'assist' },
  ],
  name: 'crab-dvm',
  provider: 'wss://darwinia-crab.api.onfinality.io/public-ws',
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
      name: 'WCKTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-DVM',
          partner: { name: 'crab', role: 'backing', symbol: 'CKTON' },
        },
      ],
      type: 'native',
      host: 'crab-dvm',
      logo: 'token-wckton.svg',
      symbol: 'WCKTON',
      address: '0x159933C635570D5042723359fbD1619dFe83D3f3',
    },
    {
      name: 'xRING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'darwinia', role: 'backing', symbol: 'RING' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-heco',
          partner: { name: 'heco', role: 'issuing', symbol: 'RING' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'ethereum', role: 'issuing', symbol: 'RING' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-polygon',
          partner: { name: 'polygon', role: 'issuing', symbol: 'RING' },
        },
      ],
      type: 'mapping',
      host: 'crab-dvm',
      logo: 'token-oring.svg',
      symbol: 'xRING',
      address: '0x7399Ea6C9d35124d893B8d9808930e9d3F211501',
    },
    {
      name: 'xKTON',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'darwinia', role: 'backing', symbol: 'KTON' },
        },
      ],
      type: 'mapping',
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
          partner: { name: 'darwinia-dvm', role: 'backing', symbol: 'wRING' },
        },
      ],
      type: 'mapping',
      host: 'crab-dvm',
      logo: 'token-oring.svg',
      symbol: 'xWRING',
      address: '0x16D8A045F0B61786810DB5d4C2035932f8A3341A',
    },
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-bsc',
          partner: { name: 'bsc', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDT' },
        },
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
      type: 'mapping',
      host: 'crab-dvm',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-bsc',
          partner: { name: 'bsc', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-avalanche',
          partner: { name: 'avalanche', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-optimism',
          partner: { name: 'optimism', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-arbitrum',
          partner: { name: 'arbitrum', role: 'issuing', symbol: 'USDC' },
        },
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
      type: 'mapping',
      host: 'crab-dvm',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c',
    },
  ],
  ss58Prefix: 42,
  specVersion: 1232,
  wallets: ['metamask'],
};
