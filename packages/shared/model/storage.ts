import { THEME } from '../config/theme';
import {
  ChainConfig,
  EthereumExtension,
  Network,
  PolkadotExtension,
  SupportedWallet,
  TokenWithBridgesInfo,
} from './network';

export interface HashInfo {
  from?: Pick<TokenWithBridgesInfo, 'symbol' | 'host'>;
  to?: Pick<TokenWithBridgesInfo, 'symbol' | 'host'>;
}

export type StorageInfo = HashInfo & {
  theme?: THEME;
  config?: Partial<{ [key in Network]: ChainConfig }>;
  custom?: Network[];
  hideWarning?: boolean;
  activeMetamaskAccount?: string;
  activePolkadotAccount?: string;
  activeWallet?: {
    chain?: Network;
    wallet?: SupportedWallet;
  };
  recentlyUsedWallet?: {
    ethereum?: EthereumExtension;
    polkadot?: PolkadotExtension;
  };
};
