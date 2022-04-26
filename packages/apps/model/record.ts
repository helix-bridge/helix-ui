import { Observable } from 'rxjs';
import { RecordRequestParams } from './record-api';

interface SimpleBlock {
  blockHash: string;
  extrinsicHash: string;
  // eslint-disable-next-line id-denylist
  number: number;
  specVersion: number;
}

export interface BridgeDispatchEventRecord {
  data: string; // json string [ChainId, [LaneId, MessageNonce], DispatchResult]
  isSuccess: boolean;
  method:
    | 'MessageRejected'
    | 'MessageVersionSpecMismatch'
    | 'MessageWeightMismatch'
    | 'MessageSignatureMismatch'
    | 'MessageCallDecodeFailed'
    | 'MessageCallRejected'
    | 'MessageDispatchPaymentFailed'
    | 'MessageDispatched';
  block: SimpleBlock;
  index: number;
}

export interface RecordList<T> {
  count: number;
  list: T[];
}

export type FetchRecords<Res extends RecordList<unknown>, Req = RecordRequestParams> = (req: Req) => Observable<Res>;

export interface RecordsHooksResult<T extends RecordList<unknown>, R = RecordRequestParams> {
  fetchIssuingRecords: FetchRecords<T, R>;
  fetchRedeemRecords: FetchRecords<T, R>;
}
