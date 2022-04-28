import { ChainConfig } from '../../model';

export const tronConfig: ChainConfig = {
  isTest: false,
  logos: [
    { name: 'tron.png', type: 'main' },
    { name: 'tron.png', type: 'minor' },
  ],
  mode: 'native',
  name: 'tron',
  provider: '',
  social: {
    portal: '',
    github: '',
    twitter: '',
  },
  tokens: [{ name: 'TRX', decimals: 18, bridges: [], type: 'native', logo: 'trx.png', symbol: 'TRX', address: '' }],
  category: ['tron'],
};
