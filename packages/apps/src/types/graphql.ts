import { TokenSymbol } from "./token";
import { BridgeCategory } from "./bridge";
import { Network } from "./chain";

export enum RecordStatus {
  PENDING,
  PENDING_TO_REFUND,
  PENDING_TO_CLAIM,
  SUCCESS,
  REFUNDED,
  PENDING_TO_CONFIRM_REFUND,
  FAILED,
}

export interface HistoryRecord {
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
    records: HistoryRecord[];
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
  historyRecordById?: HistoryRecord | null;
}

export interface RecordVariables {
  id: string;
}

interface Lnv20RelayInfo {
  id: string;
  nonce: string;
  targetNonce?: string | null;
  fromChain: Network;
  toChain: Network;
  bridge: BridgeCategory;
  relayer: string;
  sendToken?: string | null;
  transaction_hash: string;
  timestamp: number;
  margin?: string | null;
  baseFee?: string | null;
  liquidityFeeRate?: number | null;
  slashCount?: number | null;
  withdrawNonce?: string | null;
  lastTransferId?: string | null;
  cost?: string | null;
  profit?: string | null;
  heartbeatTimestamp?: number | null;
}

export interface RelayersResponseData {
  sortedLnv20RelayInfos?: Pick<
    Lnv20RelayInfo,
    "relayer" | "margin" | "baseFee" | "liquidityFeeRate" | "lastTransferId" | "withdrawNonce"
  >[];
}

export interface RelayersVariables {
  amount: string;
  decimals?: number | null;
  bridge?: BridgeCategory | null;
  token?: string | null;
  fromChain?: Network | null;
  toChain?: Network | null;
}

export type LnRelayerInfo = Pick<
  Lnv20RelayInfo,
  | "id"
  | "relayer"
  | "bridge"
  | "fromChain"
  | "toChain"
  | "sendToken"
  | "baseFee"
  | "liquidityFeeRate"
  | "margin"
  | "cost"
  | "profit"
  | "heartbeatTimestamp"
>;

export interface LnRelayersResponseData {
  queryLnv20RelayInfos?: {
    total: number;
    records: LnRelayerInfo[];
  };
}

export interface LnRelayersVariables {
  fromChain?: Network;
  toChain?: Network;
  relayer?: string;
  row: number;
  page: number;
}

export interface SpecialRelayerResponseData {
  queryLnv20RelayInfos?: {
    total: number;
  };
}

export interface SpecialRelayerVariables {
  fromChain?: Network;
  toChain?: Network;
  bridge?: BridgeCategory;
  relayer?: string;
}
