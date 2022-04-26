import { DVMChainConfig } from '../../model';

export const pangolinConfig: DVMChainConfig = {
  dvm: {
    kton: '0xDCd3bC4138afE6F324eaA12C356A20cD576edF08',
    ring: '0xcfDEb76be514c8B8DC8B509E63f95E34ebafD81e',
    smartKton: '0x8809f9b3ACEF1dA309f49b5Ab97A4C0faA64E6Ae', // ethereum contract address
    smartRing: '0xc52287b259b2431ba0f61BC7EBD0eD793B0b7044',
    smartWithdrawKton: '0x0000000000000000000000000000000000000015',
    smartWithdrawRing: '0x0000000000000000000000000000000000000015',
  },
  ethereumChain: {
    blockExplorerUrls: ['https://pangolin.subscan.io/'],
    chainId: '43',
    chainName: 'pangolin',
    nativeCurrency: {
      decimals: 18,
      symbol: 'PRING',
    },
    rpcUrls: ['https://pangolin-rpc.darwinia.network/'],
  },
  endpoints: {
    mmr: 'https://api.subquery.network/sq/darwinia-network/pangolin-mmr',
  },
  isTest: true,
  logos: [
    { name: 'pangolin.png', type: 'main', mode: 'native' },
    { name: 'pangolin.svg', type: 'minor', mode: 'native' },
    { name: 'pangolin-logo.svg', type: 'assist', mode: 'native' },
    { name: 'pangolin-smart.png', type: 'main', mode: 'dvm' },
    { name: 'pangolin-2.png', type: 'minor', mode: 'dvm' },
  ],
  name: 'pangolin',
  provider: {
    etherscan: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
    rpc: 'wss://pangolin-rpc.darwinia.network',
  },
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangolin-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    { name: 'PRING', decimals: 9, bridges: ['helix'], type: 'native', logo: 'token-ring.svg', symbol: '', address: '' },
    { name: 'PKTON', decimals: 9, bridges: ['helix'], type: 'native', logo: 'token-kton.svg', symbol: '', address: '' },
    {
      name: 'xORING',
      decimals: 9,
      bridges: ['helix'],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'xORING',
      address: '',
    },
    {
      name: 'xOKTON',
      decimals: 9,
      bridges: ['helix'],
      type: 'mapping',
      logo: 'token-kton.svg',
      symbol: 'xOKTON',
      address: '',
    },
    {
      name: 'WPRING',
      decimals: 9,
      bridges: ['helix'],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'WPRING',
      address: '',
    },
    {
      name: 'WPKTON',
      decimals: 9,
      bridges: ['helix'],
      type: 'mapping',
      logo: 'token-kton.svg',
      symbol: 'WPKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 28060,
  type: ['polkadot', 'darwinia'],
};
