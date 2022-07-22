import { RecordStatus } from '../../config/constant';

export interface SubstrateDVM2SubstrateRecord {
  lane_id: string;
  nonce: string;
  request_transaction: string;
  response_transaction: string;
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  result: RecordStatus;
  start_timestamp: string;
  end_timestamp: string;
  fee: string;
}

export interface LockedRecord {
  id: string;
  recipient: string;
  transaction: string;
  amount: string;
  mapping_token: string;
}

export interface Substrate2SubstrateDVMRecord {
  laneId: string;
  nonce: string;
  requestTxHash: string;
  responseTxHash: string;
  senderId: string;
  recipient: string;
  token: string;
  amount: string;
  result: RecordStatus;
  startTimestamp: string;
  endTimestamp: string;
  fee: string;
}

export interface UnlockedRecord {
  id: string;
  recipient: string;
  token: string;
  amount: string;
  timestamp: string;
  txHash: string;
  block: string;
}

export interface SubstrateDVM2SubstrateRecordsRes {
  burnRecordEntities: SubstrateDVM2SubstrateRecord[];
}

export interface SubstrateDVM2SubstrateRecordRes {
  burnRecordEntity: SubstrateDVM2SubstrateRecord;
}

export interface Substrate2SubstrateDVMRecordsRes {
  s2sEvents: {
    totalCount: number;
    nodes: (Substrate2SubstrateDVMRecord & { id: string })[];
  };
}
export interface Substrate2SubstrateDVMRecordRes {
  s2sEvent: Substrate2SubstrateDVMRecord;
}
