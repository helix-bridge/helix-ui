import { DVMChainConfig } from '../../model';

export const pangolinDVMConfig: DVMChainConfig = {
  ethereumChain: {
    blockExplorerUrls: ['https://pangolin.subscan.io/'],
    chainId: '0x2b',
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
  name: 'pangolin-dvm',
  provider: { https: 'https://pangolin-rpc.darwinia.network', wss: 'wss://pangolin-rpc.darwinia.network' },
  social: {
    portal: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpangolin-rpc.darwinia.network#/explorer',
    github: 'https://github.com/darwinia-network',
    twitter: 'https://twitter.com/DarwiniaNetwork',
  },
  tokens: [
    {
      name: 'PRING',
      decimals: 18,
      cross: [
        {
          bridge: 'substrateDVM-ethereum',
          category: 'helix',
          partner: { name: 'goerli', role: 'issuing', symbol: 'PRING', claim: true },
        },
      ],
      type: 'native',
      host: 'pangolin-dvm',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '0x3F3eDBda6124462a09E071c5D90e072E0d5d4ed4',
    },
    {
      name: 'xWORING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'darwiniaDVM-crabDVM',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'ORING' },
        },
      ],
      type: 'erc20',
      host: 'pangolin-dvm',
      logo: 'token-ring.svg',
      symbol: 'xWORING',
      address: '0xba01cfcad99c17dad9a859bd881dc99851faecf5',
    },
  ],
  ss58Prefix: 42,
  specVersion: 6200,
  wallets: ['metamask', 'mathwallet-ethereum'],
};
