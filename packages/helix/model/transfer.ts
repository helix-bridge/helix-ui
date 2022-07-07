import { ChainConfig, TokenWithBridgesInfo } from 'shared/model';

export interface TransferStep {
  chain: ChainConfig;
  sender: string;
  recipient: string;
  token: TokenWithBridgesInfo;
}
