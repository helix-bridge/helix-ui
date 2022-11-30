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
      cross: [
        {
          category: 'XCM',
          bridge: 'moonriver-shiden',
          partner: { name: 'shiden', role: 'issuing', symbol: 'MOVR' },
        },
        {
          category: 'XCM',
          bridge: 'moonriver-karura',
          partner: { name: 'karura', role: 'issuing', symbol: 'MOVR' },
        },
      ],
      type: 'native',
      host: 'moonriver',
      logo: 'token-movr.png',
      symbol: 'MOVR',
      address: '0x0000000000000000000000000000000000000802',
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
    {
      name: 'SDN',
      decimals: 18,
      cross: [
        {
          category: 'XCM',
          bridge: 'shiden-moonriver',
          partner: { name: 'shiden', role: 'backing', symbol: 'SDN' },
        },
      ],
      type: 'mapping',
      host: 'moonriver',
      logo: 'token-sdn.png',
      symbol: 'xcSDN',
      address: '0xFFFfffFF0Ca324C842330521525E7De111F38972',
    },
    {
      name: 'KAR',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-moonriver',
          partner: { name: 'karura', role: 'backing', symbol: 'KAR' },
        },
      ],
      type: 'mapping',
      host: 'moonriver',
      logo: 'token-karura.svg',
      symbol: 'xcKAR',
      address: '0xFfFFFFfF08220AD2E6e157f26eD8bD22A336A0A5',
    },
    {
      name: 'KUSD',
      decimals: 12,
      cross: [
        {
          category: 'XCM',
          bridge: 'karura-moonriver',
          partner: { name: 'karura', role: 'backing', symbol: 'KUSD' },
        },
      ],
      type: 'mapping',
      host: 'moonriver',
      logo: 'token-ausd.png',
      symbol: 'KUSD',
      address: '0xFfFffFFfa1B026a00FbAA67c86D5d1d5BF8D8228',
    },
  ],
  ss58Prefix: 8,
  specVersion: 1901,
  paraId: 2023,
  wallets: ['metamask', 'mathwallet-ethereum'],
};
