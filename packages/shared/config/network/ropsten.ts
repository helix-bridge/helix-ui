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
  name: 'ropsten',
  provider: 'wss://ropsten.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ropsten',
    twitter: 'https://twitter.com/ethdotorg',
  },
  // FIXME: Token order must be 0 for ring, 1 for kton;
  tokens: [
    {
      name: 'PRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'pangolin', role: 'receiver', symbol: 'PRING' },
        },
      ],
      type: 'mapping',
      host: 'ropsten',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '0xb52FBE2B925ab79a821b261C82c5Ba0814AAA5e0',
      claim: true,
    },
    {
      name: 'PKTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'pangolin', role: 'receiver', symbol: 'PKTON' },
        },
      ],
      type: 'mapping',
      host: 'ropsten',
      logo: 'token-kton.svg',
      symbol: 'PKTON',
      address: '0x1994100c58753793D52c6f457f189aa3ce9cEe94',
      claim: true,
    },
  ],
  wallets: ['metamask'],
};
