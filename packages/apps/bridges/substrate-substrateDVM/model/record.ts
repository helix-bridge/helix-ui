import { BridgeDispatchEventRecord } from '../../../model';

export interface SubstrateDVM2SubstrateRecord {
  lane_id: string;
  nonce: string;
  request_transaction: string;
  response_transaction: string;
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  // eslint-disable-next-line no-magic-numbers
  result: 0 | 1 | 2;
  start_timestamp: string;
  end_timestamp: string;
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
  // eslint-disable-next-line no-magic-numbers
  result: 0 | 1 | 2;
  startTimestamp: string;
  endTimestamp: string;
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

export interface BridgeDispatchEventRes {
  bridgeDispatchEvent: BridgeDispatchEventRecord;
}
