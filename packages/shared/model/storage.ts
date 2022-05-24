import { THEME } from '../config/theme';
import { ChainConfig, Network, NetworkMode } from './network';

export interface HashInfo {
  fMode?: NetworkMode | null;
  from?: string | null;
  recipient?: string | null;
  tMode?: NetworkMode | null;
  to?: string | null;
}

export interface HistoryRouteParam {
  fMode: NetworkMode;
  from: string;
  sender: string;
  tMode: NetworkMode;
  to: string;
}

export interface StorageInfo extends HashInfo {
  theme?: THEME;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
  activeAccount?: string;
  warning?: boolean;
}
