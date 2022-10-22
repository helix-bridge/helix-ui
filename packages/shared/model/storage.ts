import { THEME } from '../config/theme';
import { ChainConfig, Network, SupportedWallet, TokenWithBridgesInfo } from './network';

export interface HashInfo {
  from?: Pick<TokenWithBridgesInfo, 'symbol' | 'host'>;
  to?: Pick<TokenWithBridgesInfo, 'symbol' | 'host'>;
}

export type StorageInfo = HashInfo & {
  theme?: THEME;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
  hideWarning?: boolean;
  activeAccount?: string;
  activeWallet?: {
    chain?: Network;
    wallet?: SupportedWallet;
  };
};
