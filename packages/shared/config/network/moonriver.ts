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
  logos: [{ name: 'moonriver-circle.svg', type: 'main' }],
  name: 'moonriver',
  fullName: 'Moonriver',
  provider: { https: 'https://moonriver-rpc.dwellir.com', wss: 'wss://wss.api.moonriver.moonbeam.network' },
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
      type: 'erc20',
      host: 'moonriver',
      logo: 'token-crab.svg',
      symbol: 'CRAB',
      address: '0xFFFffFfF8283448b3cB519Ca4732F2ddDC6A6165',
    },
  ],
  ss58Prefix: 8,
  specVersion: 1901,
  paraId: 2023,
  wallets: ['metamask', 'mathwallet-ethereum'],
};
