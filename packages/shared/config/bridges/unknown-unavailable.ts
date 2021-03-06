import { Bridge } from '../../model';
import { crabConfig, pangoroConfig } from '../network';

export const unknownUnavailable = new Bridge(
  pangoroConfig,
  crabConfig,
  {},
  { category: 'helix', name: 'substrate-DVM' }
);
