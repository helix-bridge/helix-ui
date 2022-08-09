import { EthereumChainConfig } from '../../model';

export const arbitrumConfig: EthereumChainConfig = {
  ethereumChain: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum',
    nativeCurrency: {
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  },
  isTest: false,
  logos: [{ name: 'arbitrum.png', type: 'main' }],
  name: 'arbitrum',
  provider: 'wss://arbitrum.getblock.io/mainnet',
  social: {
    portal: 'https://arbitrum.io/',
    github: 'https://github.com/OffchainLabs',
    twitter: 'https://twitter.com/arbitrum',
  },
  tokens: [
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bnb-arbitrum',
          partner: { name: 'BNB Chain', role: 'backing', symbol: 'USDT' },
        },
      ],
      type: 'mapping',
      host: 'BNB Chain',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    {
      name: 'USDC',
      decimals: 18,
      cross: [
        {
          category: 'cBridge',
          bridge: 'bnb-arbitrum',
          partner: { name: 'BNB Chain', role: 'backing', symbol: 'USDC' },
        },
      ],
      type: 'mapping',
      host: 'BNB Chain',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    },
  ],
  wallets: ['metamask'],
};
