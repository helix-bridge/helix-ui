import { THEME } from '../config/theme';
import { ChainConfig, Network } from './network';

export interface HashInfo {
  from?: string | null;
  recipient?: string | null;
  to?: string | null;
}

export interface HistoryRouteParam {
  from: string;
  sender: string;
  to: string;
}

export interface StorageInfo extends HashInfo {
  theme?: THEME;
  enableTestNetworks?: boolean;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
}
