import { TokenSymbol } from "./token";
import { BridgeCategory } from "./bridge";
import { Network, ChainID } from "./chain";
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

export type MessageChannel = "layerzero" | "msgline" | "sub2sub" | "arbitrum-l2";

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
  sendTokenAddress: Address | null;
  recvTokenAddress: Address | null;
  guardSignatures: string | null;
  relayer: Address | null;
  endTxHash: Hex | null;
  confirmedBlocks: string | null;
}

export interface Lnv20RelayInfo {
  id: string;
  nonce: string;
  targetNonce: string | null;
  fromChain: Network;
  toChain: Network;
  bridge: BridgeCategory;
  relayer: Address;
  sendToken: Address | null;
  transaction_hash: Hex;
  timestamp: number;
  margin: string | null;
  protocolFee: string | null;
  baseFee: string | null;
  liquidityFeeRate: number | null;
  slashCount: number | null;
  withdrawNonce: string | null;
  lastTransferId: Hex | null;
  cost: string | null;
  profit: string | null;
  heartbeatTimestamp: number | null;
  messageChannel: MessageChannel | null;
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

export interface SortedLnV20RelayInfosReqParams {
  amount: string;
  decimals?: number;
  bridge?: BridgeCategory;
  token?: Address;
  fromChain?: Network;
  toChain?: Network;
}

export interface SortedLnV20RelayInfosResData {
  sortedLnv20RelayInfos: {
    maxMargin: string;
    records: Pick<
      Lnv20RelayInfo,
      "relayer" | "margin" | "baseFee" | "protocolFee" | "liquidityFeeRate" | "lastTransferId" | "withdrawNonce"
    >[];
  } | null;
}

export type Lnv20RelayerOverview = Pick<
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
  | "messageChannel"
>;

export interface QueryLnV20RelayInfosReqParams {
  fromChain?: Network;
  toChain?: Network;
  relayer?: string;
  bridge?: BridgeCategory;
  row: number;
  page: number;
}

export interface QueryLnV20RelayInfosResData {
  queryLnv20RelayInfos: {
    total: number;
    records: Lnv20RelayerOverview[];
  } | null;
}

export interface HistoryRecordByTxHashReqParams {
  txHash: Hex;
}

export interface HistoryRecordByTxHashResData {
  historyRecordByTxHash: Pick<HistoryRecord, "confirmedBlocks" | "result" | "id"> | null;
}

export interface CheckLnBridgeExistReqParams {
  fromChainId: ChainID;
  toChainId: ChainID;
  fromToken: Address;
  toToken: Address;
}

export interface CheckLnBridgeExistResData {
  checkLnBridgeExist: boolean | null;
}
