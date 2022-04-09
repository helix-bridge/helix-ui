import { THEME } from '../config/theme';
import { Network, ChainConfig, NetworkMode } from './network';

export interface HashInfo {
  fMode?: NetworkMode | null;
  from?: Network | null;
  recipient?: string | null;
  tMode?: NetworkMode | null;
  to?: Network | null;
}

export interface HistoryRouteParam {
  fMode: NetworkMode;
  from: Network;
  sender: string;
  tMode: NetworkMode;
  to: Network;
}

export interface StorageInfo extends HashInfo {
  theme?: THEME;
  enableTestNetworks?: boolean;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
}
