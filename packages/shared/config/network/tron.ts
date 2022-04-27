import { ChainConfig } from '../../model';

export const tronConfig: ChainConfig = {
  isTest: false,
  logos: [
    { name: 'tron.png', type: 'main' },
    { name: 'tron.png', type: 'minor' },
  ],
  name: 'tron',
  provider: '',
  social: {
    portal: '',
    github: '',
    twitter: '',
  },
  tokens: [
    { name: 'TRX', decimals: 18, bridges: ['helix'], type: 'native', logo: 'trx.png', symbol: 'TRX', address: '' },
  ],
  type: ['tron'],
};
