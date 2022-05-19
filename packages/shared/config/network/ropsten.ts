import { EthereumChainConfig } from '../../model';

export const ropstenConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x3',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: [],
  },
  logos: [{ name: 'ropsten.png', type: 'main' }],
  isTest: true,
  mode: 'native',
  name: 'ropsten',
  provider: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ropsten',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'PRING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'pangolin', mode: 'native', role: 'receiver', symbol: 'PRING' },
        },
      ],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '',
      claim: true,
    },
    {
      name: 'PKTON',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'pangolin', mode: 'native', role: 'receiver', symbol: 'PKTON' },
        },
      ],
      type: 'mapping',
      logo: 'token-kton.svg',
      symbol: 'PKTON',
      address: '',
      claim: true,
    },
  ],
  wallets: ['metamask'],
};
