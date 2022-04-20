import { ChainConfig } from '../../model';

export const tronConfig: ChainConfig = {
  isTest: false,
  logos: [
    { name: 'tron.png', type: 'main', mode: 'native' },
    { name: 'tron.png', type: 'minor', mode: 'native' },
  ],
  name: 'tron',
  provider: {
    etherscan: '',
    rpc: '',
  },
  social: {
    portal: '',
    github: '',
    twitter: '',
  },
  type: ['tron'],
};
