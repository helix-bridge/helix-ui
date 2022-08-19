import { THEME } from '../config/theme';
import { ChainConfig, Network, SupportedWallet } from './network';

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

export type StorageInfo = HashInfo & {
  theme?: THEME;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
  hideWarning?: boolean;
} & {
  [key in SupportedWallet]?: string;
};
