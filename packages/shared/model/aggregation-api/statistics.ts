import { Nullable } from '../type-operator';
import { Result } from '../substrate-substrateDVM';
import { Network, NetworkMode } from '../network';

export interface DailyStatistic {
  id: string;
  dailyVolume: string;
  dailyCount: number;
}

export interface Substrate2SubstrateRecord {
  amount: string;
  bridge: string;
  endTime?: Nullable<number>;
  fee: string;
  fromChain: Network;
  fromChainMode: NetworkMode;
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
  toChainMode: NetworkMode;
  token: string;
}
