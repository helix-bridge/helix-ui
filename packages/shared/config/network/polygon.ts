import { EthereumChainConfig } from '../../model';

export const polygonConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '1',
    chainName: 'Polygon',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
  },
  isTest: true,
  logos: [{ name: 'polygon.svg', type: 'main' }],
  name: 'polygon',
  provider: 'https://polygon-rpc.com',
  social: {
    portal: 'https://polygon.technology/',
    github: 'https://github.com/maticnetwork/',
    twitter: 'https://twitter.com/0xPolygon',
  },
  tokens: [
    { name: 'RING', decimals: 18, cross: [], type: 'mapping', host: 'polygon', logo: '', symbol: 'RING', address: '' },
    { name: 'MATIC', decimals: 18, cross: [], type: 'native', host: 'polygon', logo: '', symbol: 'MATIC', address: '' },
  ],
  wallets: ['metamask'],
};
