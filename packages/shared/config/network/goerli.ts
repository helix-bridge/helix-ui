import { EthereumChainConfig } from '../../model';

export const goerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x5',
    chainName: 'Goerli test network',
    nativeCurrency: {
      decimals: 18,
      symbol: 'GoerliETH',
    },
    rpcUrls: [],
  },
  logos: [{ name: 'ropsten.png', type: 'main' }],
  isTest: true,
  name: 'goerli',
  fullName: 'Goerli',
  provider: {
    https: 'https://goerli.infura.io/v3/5350449ccd2349afa007061e62ee1409',
    wss: 'wss://goerli.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
  },
  social: {
    portal: 'https://ethereum.org/en/',
    github: 'https://github.com/ethereum',
    twitter: 'https://twitter.com/ethdotorg',
  },
  tokens: [
    {
      name: 'GoerliETH',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'goerli',
      logo: 'token-ethereum.svg',
      symbol: 'GoerliETH',
      address: '',
    },
    {
      name: 'PRING',
      decimals: 18,
      cross: [
        {
          category: 'helix',
          bridge: 'substrateDVM-ethereum',
          partner: { name: 'pangolin-dvm', role: 'backing', symbol: 'PRING' },
        },
      ],
      type: 'erc20',
      host: 'goerli',
      logo: 'token-ring.svg',
      symbol: 'PRING',
      address: '0xeb93165E3CDb354c977A182AbF4fad3238E04319',
    },
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'lnbridgev20-opposite',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'arbitrum-goerli', role: 'issuing', symbol: 'RING' },
        },
        {
          category: 'l1tol2',
          bridge: 'ethereum-arbitrum',
          partner: { name: 'arbitrum-goerli', role: 'issuing', symbol: 'RING' },
        },
      ],
      type: 'erc20',
      host: 'goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0x1836bafa3016dd5ce543d0f7199cb858ec69f41e',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
