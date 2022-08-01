import { Nullable } from '../type-operator';
import { Network } from '../network';
import { RecordStatus } from '../../config/constant';
import { BridgeCategory } from '../bridge';

export interface DailyStatistic {
  timestamp: string;
  dailyVolume: string;
  dailyCount: string;
}

export interface HelixHistoryRecord {
  amount: string;
  bridge: BridgeCategory;
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
  reason: string;
  result: RecordStatus;
  sender: string;
  startTime: number;
  toChain: Network;
  token: string;
}
