import { EthereumChainConfig } from '../../model';

export const ethereumConfig: EthereumChainConfig = {
  mode: 'native',
  ethereumChain: {
    chainId: '0x1',
    chainName: '',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: [],
  },
  isTest: false,
  logos: [{ name: 'ethereum.png', type: 'main' }],
  name: 'ethereum',
  provider: 'wss://mainnet.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum/ethereum-org-website',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'darwinia', mode: 'native', role: 'receiver', symbol: 'RING' },
        },
      ],
      type: 'mapping',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
      claim: true,
    },
    {
      name: 'KTON',
      decimals: 9,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'darwinia', mode: 'native', role: 'receiver', symbol: 'KTON' },
        },
      ],
      type: 'mapping',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
      claim: true,
    },
  ],
  wallets: ['metamask'],
};
