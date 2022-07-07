import { Nullable } from '../type-operator';
import { Result } from '../substrate-substrateDVM';
import { Network } from '../network';

export interface DailyStatistic {
  timestamp: string;
  dailyVolume: string;
  dailyCount: string;
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
  targetTxHash: string;
  bridgeDispatchError: string;
  result: Result;
  sender: string;
  startTime: number;
  toChain: Network;
  token: string;
}
