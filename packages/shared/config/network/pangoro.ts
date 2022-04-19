import { PolkadotChainConfig } from '../../model';

export const pangoroConfig: PolkadotChainConfig = {
  facade: {
    logo: '/image/pangoro.png',
    logoMinor: '/image/pangoro.png',
    logoWithText: '',
  },
  endpoints: {
    mmr: '',
  },
  isTest: true,
  name: 'pangoro',
  provider: {
    etherscan: '',
    rpc: 'wss://pangoro-rpc.darwinia.network',
  },
  ss58Prefix: 18,
  specVersion: 28060,
  type: ['polkadot', 'darwinia'],
};
