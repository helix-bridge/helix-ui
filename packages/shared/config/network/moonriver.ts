import { ParachainEthereumCompatibleChainConfig } from '../../model';

export const moonriverConfig: ParachainEthereumCompatibleChainConfig = {
  ethereumChain: {
    blockExplorerUrls: ['https://moonriver.moonscan.io/'],
    chainId: '0x505',
    chainName: 'Moonriver',
    nativeCurrency: {
      decimals: 18,
      symbol: 'MOVR',
    },
    rpcUrls: ['https://rpc.api.moonriver.moonbeam.network'],
  },
  isTest: false,
  logos: [{ name: 'moonriver.svg', type: 'main' }],
  name: 'moonriver',
  fullName: 'Moonriver',
  provider: 'wss://wss.api.moonriver.moonbeam.network',
  social: {
    portal: 'https://moonbeam.network/networks/moonriver/',
    github: 'https://github.com/PureStake/moonbeam',
    twitter: 'https://twitter.com/moonbeamnetwork',
  },
  tokens: [
    {
      name: 'MOVR',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'moonriver',
      logo: 'token-movr.png',
      symbol: 'MOVR',
      address: '',
    },
    {
      name: 'CRAB',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'crabParachain-moonriver',
          partner: { name: 'crab-parachain', role: 'backing', symbol: 'CRAB' },
        },
      ],
      type: 'mapping',
      host: 'moonriver',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '',
    },
  ],
  ss58Prefix: 8,
  specVersion: 1701,
  paraId: 2023,
  wallets: ['metamask'],
};
