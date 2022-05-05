import { DVMChainConfig } from '../../model';

export const pangolinDVMConfig: DVMChainConfig = {
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
  isTest: true,
  logos: [
    { name: 'pangolin-smart.png', type: 'main' },
    { name: 'pangolin-2.png', type: 'minor' },
    { name: 'pangolin-logo.svg', type: 'assist' },
  ],
  mode: 'dvm',
  name: 'pangolin',
  provider: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangolin-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'PRING',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-DVM',
          partner: { name: 'pangolin', mode: 'native', role: 'issuer', symbol: 'PRING' },
        },
      ],
      type: 'native',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '0xc52287b259b2431ba0f61BC7EBD0eD793B0b7044',
    },
    {
      name: 'WPKTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-DVM',
          partner: { name: 'pangolin', mode: 'native', role: 'issuer', symbol: 'PKTON' },
        },
      ],
      type: 'native',
      logo: 'token-kton.svg',
      symbol: 'WPKTON',
      address: '0x8809f9b3ACEF1dA309f49b5Ab97A4C0faA64E6Ae',
    },
    {
      name: 'xORING',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'pangoro', mode: 'native', role: 'issuer', symbol: 'oRING' },
        },
      ],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'xORING',
      address: '',
    },
    {
      name: 'xOKTON',
      decimals: 9,
      bridges: [
        {
          category: 'helix',
          name: 'substrate-substrateDVM',
          partner: { name: 'pangoro', mode: 'native', role: 'issuer', symbol: 'oKTON' },
        },
      ],
      type: 'mapping',
      logo: 'token-kton.svg',
      symbol: 'xOKTON',
      address: '',
    },
  ],
  ss58Prefix: 42,
  specVersion: 28060,
  category: ['dvm', 'polkadot', 'ethereum'],
};
