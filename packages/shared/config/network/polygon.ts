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
  logos: [{ name: 'polygon.svg', type: 'main', mode: 'native' }],
  name: 'polygon',
  provider: {
    etherscan: 'https://polygon-rpc.com/',
    rpc: '',
  },
  social: {
    portal: 'https://polygon.technology/',
    github: 'https://github.com/maticnetwork/',
    twitter: 'https://twitter.com/0xPolygon',
  },
  tokens: [
    { name: 'RING', precision: 18, bridges: ['helix'], type: 'mapping', logo: '' },
    { name: 'MATIC', precision: 18, bridges: ['helix'], type: 'native', logo: '' },
  ],
  type: ['ethereum'],
};
