import { DVMChainConfig } from '../../model';

export const crabConfig: DVMChainConfig = {
  dvm: {
    kton: '0xbfE9E136270cE46A2A6a8E8D54718BdAEBEbaA3D',
    ring: '0x588abe3F7EE935137102C5e2B8042788935f4CB0',
    smartKton: '0x159933C635570D5042723359fbD1619dFe83D3f3',
    smartRing: '0x588abe3F7EE935137102C5e2B8042788935f4CB0',
    smartWithdrawKton: '0x0000000000000000000000000000000000000015',
    smartWithdrawRing: '0x0000000000000000000000000000000000000015',
  },
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
  endpoints: {
    mmr: '',
  },
  isTest: false,
  logos: [
    { name: 'crab.png', type: 'main', mode: 'native' },
    { name: 'crab.svg', type: 'minor', mode: 'native' },
    { name: 'crab-logo.svg', type: 'assist', mode: 'native' },
    { name: 'crab-smart.png', type: 'main', mode: 'dvm' },
  ],
  name: 'crab',
  provider: {
    etherscan: '',
    rpc: 'wss://darwinia-crab.api.onfinality.io/public-ws',
  },
  social: {
    portal: 'https://crab.network/',
    github: 'https://github.com/darwinia-network/darwinia/tree/main/runtime/crab',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  type: ['polkadot', 'darwinia'],
  ss58Prefix: 42,
  specVersion: 1200,
};
