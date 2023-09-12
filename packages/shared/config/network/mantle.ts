import { hexValue } from 'ethers/lib/utils';
import { EthereumChainConfig } from '../../model';

export const mantleConfig: EthereumChainConfig = {
  ethereumChain: {
    // eslint-disable-next-line no-magic-numbers
    chainId: hexValue(5000),
    chainName: 'Mantle',
    nativeCurrency: {
      decimals: 18,
      symbol: 'MNT',
    },
    rpcUrls: ['https://rpc.mantle.xyz'],
  },
  isTest: false,
  logos: [{ name: 'mantle.svg', type: 'main' }],
  name: 'mantle',
  fullName: 'Mantle',
  provider: {
    https: 'https://rpc.mantle.xyz',
    wss: 'wss://rpc.mantle.xyz',
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
      host: 'mantle',
      logo: 'token-ring.svg',
      symbol: 'RING',
      address: '',
    },
    {
      name: 'KTON',
      decimals: 18,
      cross: [],
      type: 'erc20',
      host: 'mantle',
      logo: 'token-kton.svg',
      symbol: 'KTON',
      address: '',
    },
    {
      name: 'MNT',
      decimals: 18,
      cross: [],
      type: 'native',
      host: 'mantle',
      logo: 'mnt.svg',
      symbol: 'MNT',
      address: '',
    },
    {
      name: 'USDC',
      decimals: 6,
      cross: [],
      type: 'erc20',
      host: 'mantle',
      logo: 'token-usdc.svg',
      symbol: 'USDC',
      address: '',
    },
    {
      name: 'USDT',
      decimals: 6,
      cross: [],
      type: 'erc20',
      host: 'mantle',
      logo: 'token-usdt.svg',
      symbol: 'USDT',
      address: '',
    },
  ],
  wallets: ['metamask', 'mathwallet-ethereum'],
};
