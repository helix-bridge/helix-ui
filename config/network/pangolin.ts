import { DVMChainConfig } from '../../model';

export const pangolinConfig: DVMChainConfig = {
  dvm: {
    kton: '0xDCd3bC4138afE6F324eaA12C356A20cD576edF08',
    ring: '0xcfDEb76be514c8B8DC8B509E63f95E34ebafD81e',
    smartKton: '0x8809f9b3ACEF1dA309f49b5Ab97A4C0faA64E6Ae',
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
  facade: {
    logo: '/image/pangolin.png',
    logoMinor: '/image/pangolin.svg',
    logoWithText: '/image/pangolin-logo.svg',
    logoAssist: '/image/pangolin-white-bg.png',
    logoAssist2: '/image/pangolin-2.png',
  },
  isTest: true,
  name: 'pangolin',
  provider: {
    etherscan: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
    rpc: 'wss://pangolin-rpc.darwinia.network',
  },
  ss58Prefix: 42,
  specVersion: 28060,
  type: ['polkadot', 'darwinia'],
};
