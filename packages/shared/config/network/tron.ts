import { ChainConfig } from '../../model';

export const tronConfig: ChainConfig = {
  facade: {
    logo: '/image/tron.png',
    logoMinor: '/image/tron.png',
    logoWithText: '',
  },
  isTest: false,
  name: 'tron',
  provider: {
    etherscan: '',
    rpc: '',
  },
  type: ['tron'],
};
