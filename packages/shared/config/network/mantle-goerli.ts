import { hexValue } from 'ethers/lib/utils';
import { EthereumChainConfig } from '../../model';

export const mantleGoerliConfig: EthereumChainConfig = {
  ethereumChain: {
    // eslint-disable-next-line no-magic-numbers
    chainId: hexValue(5001),
    chainName: 'Mantle Testnet',
    nativeCurrency: {
      decimals: 18,
      symbol: 'MNT',
    },
    rpcUrls: ['https://rpc.testnet.mantle.xyz'],
  },
  isTest: true,
  logos: [{ name: 'mantle.svg', type: 'main' }],
  name: 'mantle-goerli',
  fullName: 'Mantle Testnet',
  provider: {
    https: 'https://rpc.testnet.mantle.xyz',
    wss: 'wss://rpc.testnet.mantle.xyz',
  },
  social: {
    portal: 'https://www.mantle.xyz/',
    github: 'https://github.com/mantlenetworkio',
    twitter: 'https://twitter.com/0xMantle',
  },
  tokens: [
    {
      name: 'RING',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'mantle-goerli',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'mantle-goerli',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
    {
      name: 'MNT',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'mantle-goerli',
      logo: 'mnt.svg',
      symbol: 'MNT',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [
        {
          category: 'lnbridgev20-default',
          bridge: 'mantle-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'mantle-linea',
          partner: { name: 'linea-goerli', role: 'issuing', symbol: 'USDC' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'mantle-arbitrum',
          partner: { name: 'arbitrum-goerli', role: 'issuing', symbol: 'USDC' },
        },
      ],
      type: 'erc20',
      host: 'mantle-goerli',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '0x0258Eb547bFEd540ed17843658C018569fe1E328',
    },
    {
      name: 'USDT',
      decimals: 18,
      cross: [
        {
          category: 'lnbridgev20-default',
          bridge: 'mantle-ethereum',
          partner: { name: 'goerli', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'mantle-linea',
          partner: { name: 'linea-goerli', role: 'issuing', symbol: 'USDT' },
        },
        {
          category: 'lnbridgev20-default',
          bridge: 'mantle-arbitrum',
          partner: { name: 'arbitrum-goerli', role: 'issuing', symbol: 'USDT' },
        },
      ],
      type: 'erc20',
      host: 'mantle-goerli',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '0x5F8D4232367759bCe5d9488D3ade77FCFF6B9b6B',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
