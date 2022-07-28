import { EthereumChainConfig } from '../../model';

export const polygonConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
  },
  isTest: false,
  logos: [{ name: 'polygon.png', type: 'main' }],
  name: 'polygon',
  provider: 'wss://ws-mainnet.matic.network',
  social: {
    portal: 'https://polygon.technology/',
    github: 'https://github.com/maticnetwork/',
    twitter: 'https://twitter.com/0xPolygon',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'crabDVM-polygon',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'xRING' },
        },
      ],
      type: 'mapping',
      host: 'polygon',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f',
    },
    // { name: 'MATIC', decimals: 18, cross: [], type: 'native', host: 'polygon', logo: '', symbol: 'MATIC', address: '' },
  ],
  wallets: ['metamask'],
};
