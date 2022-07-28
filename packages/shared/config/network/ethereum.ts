import { EthereumChainConfig } from '../../model';

export const ethereumConfig: EthereumChainConfig = {
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
  // FIXME: Token order must be 0 for ring, 1 for kton;
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'darwinia', role: 'issuing', symbol: 'RING' },
        },
        {
          category: 'cBridge',
          bridge: 'crabDVM-ethereum',
          partner: { name: 'crab-dvm', role: 'backing', symbol: 'xRING' },
        },
      ],
      type: 'mapping',
      host: 'ethereum',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x9469d013805bffb7d3debe5e7839237e535ec483',
      claim: true,
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'ethereum-darwinia',
          partner: { name: 'darwinia', role: 'issuing', symbol: 'KTON' },
        },
      ],
      type: 'mapping',
      host: 'ethereum',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '0x9f284e1337a815fe77d2ff4ae46544645b20c5ff',
      claim: true,
    },
  ],
  wallets: ['metamask'],
};
