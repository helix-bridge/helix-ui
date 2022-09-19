import { EthereumChainConfig } from '../../model';

export const goerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x5',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: [],
  },
  logos: [{ name: 'ropsten.png', type: 'main' }],
  isTest: true,
  name: 'goerli',
  fullName: 'goerli',
  provider: 'https://goerli.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-ethereum',
          partner: { name: 'pangoro-dvm', role: 'backing', symbol: 'ORING' },
        },
      ],
      type: 'mapping',
      host: 'goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x69e392E057B5994da2b0E9661039970Ac4c26b8c',
    },
  ],
  wallets: ['metamask'],
};
