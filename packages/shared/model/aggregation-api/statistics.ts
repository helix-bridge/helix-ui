import { Nullable } from '../type-operator';
import { Result } from '../substrate-substrateDVM';
import { Network } from '../network';

export interface DailyStatistic {
  id: string;
  dailyVolume: string;
  dailyCount: number;
}

export interface HelixHistoryRecord {
  amount: string;
  bridge: string;
  endTime?: Nullable<number>;
  fee: string;
  feeToken: string;
  fromChain: Network;
  id: string;
  laneId: string;
  nonce: string;
  recipient: string;
  requestTxHash: string;
  responseTxHash?: Nullable<string>;
  result: Result;
  sender: string;
  startTime: number;
  toChain: Network;
  token: string;
}
