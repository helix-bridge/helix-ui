import { PolkadotChainConfig } from '../../model';

export const darwiniaConfig: PolkadotChainConfig = {
  facade: {
    logo: '/image/darwinia.png',
    logoMinor: '/image/darwinia.svg',
    logoWithText: '/image/darwinia-logo.svg',
  },
  isTest: false,
  name: 'darwinia',
  endpoints: {
    mmr: 'https://api.subquery.network/sq/darwinia-network/darwinia-mmr',
  },
  provider: {
    etherscan: '',
    rpc: 'wss://rpc.darwinia.network',
  },
  ss58Prefix: 18,
  specVersion: 1180,
  type: ['polkadot', 'darwinia'],
};
