import { TokenSymbol } from "./token";
import { BridgeCategory } from "./bridge";
import { Network } from "./chain";
import { Address, Hex } from "viem";

/**
 * From indexer
 */

export enum RecordResult {
  PENDING,
  PENDING_TO_REFUND,
  PENDING_TO_CLAIM,
  SUCCESS,
  REFUNDED,
  PENDING_TO_CONFIRM_REFUND,
  FAILED,
}

export interface HistoryRecord {
  id: string;
  fromChain: Network;
  toChain: Network;
  bridge: BridgeCategory;
  reason: string | null;
  nonce: string;
  requestTxHash: Hex;
  responseTxHash: Hex | null;
  sender: Address;
  recipient: Address;
  sendToken: TokenSymbol;
  recvToken: TokenSymbol;
  sendAmount: string;
  recvAmount: string | null;
  startTime: number;
  endTime: number | null;
  result: RecordResult;
  fee: string;
  feeToken: TokenSymbol;
  messageNonce: string | null;
  sendTokenAddress: Address;
  recvTokenAddress: Address | null;
  guardSignatures: string | null;
  relayer: Address | null;
  endTxHash: Hex | null;
  confirmedBlocks: string | null;
  extData: Hex;
}

/**
 * Custom
 */

export interface HistoryRecordsReqParams {
  row: number;
  page: number;
  sender?: string;
  recipient?: string;
  results?: RecordResult[];
  fromChains?: Network[];
  toChains?: Network[];
  bridges?: BridgeCategory[];
}

export interface HistoryRecordsResData {
  historyRecords: { total: number; records: HistoryRecord[] } | null;
}

export interface HistoryRecordReqParams {
  id: string;
}

export interface HistoryRecordResData {
  historyRecordById: HistoryRecord | null;
}

export interface HistoryRecordByTxHashReqParams {
  txHash: Hex;
}

export interface HistoryRecordByTxHashResData {
  historyRecordByTxHash: Pick<HistoryRecord, "confirmedBlocks" | "result" | "id"> | null;
}
