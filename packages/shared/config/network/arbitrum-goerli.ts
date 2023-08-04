import { EthereumChainConfig } from '../../model';

export const arbitrumGoerliConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0x66eed',
    chainName: 'ArbitrumGoerli',
    nativeCurrency: {
      decimals: 18,
      symbol: 'ETH',
    },
    rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
  },
  isTest: true,
  logos: [{ name: 'arbitrum.png', type: 'main' }],
  name: 'arbitrum-goerli',
  fullName: 'Arbitrum Goerli',
  // wss binary message
  provider: { https: 'https://goerli-rollup.arbitrum.io/rpc', wss: 'wss://arb1.arbitrum.io/feed' },
  social: {
    portal: 'https://arbitrum.io/',
    github: 'https://github.com/OffchainLabs',
    twitter: 'https://twitter.com/arbitrum',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [
        {
          category: 'helixLpBridge',
          bridge: 'arbitrum-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'RING' },
          basefee: 5000,
          index: 0,
          deprecated: true,
        },
        {
          category: 'lnbridgev20-opposite',
          bridge: 'arbitrum-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'RING' },
          basefee: 5000,
        },
      ],
      type: 'erc20',
      host: 'arbitrum-goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '0xfbad806bdf9cec2943be281fb355da05068de925',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'lnbridgev20-opposite',
          bridge: 'arbitrum-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'erc20',
      host: 'arbitrum-goerli',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0xEA70a40Df1432A1b38b916A51Fb81A4cc805a963',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
