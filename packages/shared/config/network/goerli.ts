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
  provider: 'wss://goerli.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409',
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
      name: 'ORING',
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
      symbol: 'ORING',
      address: '0xB7A9115C0a1D2baBc764957C506c34843eeE8893',
    },
  ],
  wallets: ['metamask'],
};
