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
          partner: { name: 'crab', role: 'issuer', symbol: 'CRAB' },
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
      decimals: 9,
      cross: [
        // {
        //   category: 'helix',
        //   bridge: 'substrate-DVM',
        //   partner: { name: 'crab', role: 'issuer', symbol: 'CKTON' },
        // },
      ],
      type: 'native',
      host: 'crab-dvm',
      logo: 'token-wckton.svg',
      symbol: 'WCKTON',
      address: '0x159933C635570D5042723359fbD1619dFe83D3f3',
      claim: true,
    },
    {
      name: 'xRING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'substrate-substrateDVM',
          partner: { name: 'darwinia', role: 'issuer', symbol: 'RING' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-heco',
          partner: { name: 'heco', role: 'receiver', symbol: 'RING' },
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
          partner: { name: 'darwinia', role: 'issuer', symbol: 'KTON' },
        },
      ],
      type: 'mapping',
      host: 'crab-dvm',
      logo: 'token-okton.svg',
      symbol: 'xKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 1230,
  wallets: ['metamask'],
};
