import { TokenSymbol } from "./token";
import { BridgeCategory } from "./bridge";
import { Network } from "./chain";

export enum RecordStatus {
  Pending,
  PendingToRefund,
  PendingToClaim,
  Success,
  Refunded,
  PendingToConfirmRefund,
  Failed,
}

export interface Record {
  sendAmount: string;
  recvAmount: string;
  bridge: BridgeCategory;
  endTime: number;
  fee: string;
  feeToken: TokenSymbol;
  fromChain: Network;
  guardSignatures?: string | null;
  id: string;
  nonce: string;
  messageNonce?: string | null;
  recipient: string;
  requestTxHash: string;
  responseTxHash?: string | null;
  reason?: string | null;
  result: RecordStatus;
  sender: string;
  startTime: number;
  toChain: Network;
  sendToken: TokenSymbol;
  recvToken: TokenSymbol;
  sendTokenAddress?: string | null;
  recvTokenAddress?: string | null;
  confirmedBlocks?: string | null;
}

export interface RecordsResponseData {
  historyRecords?: {
    total: number;
    records: Record[];
  } | null;
}

export interface RecordsVariables {
  row: number;
  page: number;
  sender?: string;
  recipient?: string;
  results?: RecordStatus[];
  fromChains?: Network[];
  toChains?: Network[];
  bridges?: BridgeCategory[];
  // order?: string;
}

export interface RecordResponseData {
  historyRecordById?: Record | null;
}

export interface RecordVariables {
  id: string;
}

export interface RelayerInfo {
  sendToken?: string | null;
  relayer: string;
  margin?: string | null;
  baseFee?: string | null;
  liquidityFeeRate?: number | null;
  lastTransferId?: string | null;
  withdrawNonce?: string | null; // bigint
}

export interface RelayersResponseData {
  sortedLnv20RelayInfos?: RelayerInfo[];
}

export interface RelayersVariables {
  amount: string;
  decimals?: number | null;
  bridge?: BridgeCategory | null;
  token?: string | null;
  fromChain?: Network | null;
  toChain?: Network | null;
}
