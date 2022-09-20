import { Nullable } from '../type-operator';
import { Network } from '../network';
import { RecordStatus } from '../../config/constant';
import { BridgeCategory } from '../bridge';

export interface HelixHistoryRecord {
  bridge: BridgeCategory;
  endTime?: Nullable<number>;
  fee: string;
  feeToken: string;
  fromChain: Network;
  guardSignatures?: string;
  id: string;
  messageNonce: string;
  nonce: string;
  reason: string;
  recipient: string;
  recvAmount: string;
  requestTxHash: string;
  responseTxHash: string;
  result: RecordStatus;
  sendAmount: string;
  sender: string;
  startTime: number;
  toChain: Network;
  sendToken: string;
  recvToken: string;
  sendTokenAddress: string;
  recvTokenAddress: string;
}
