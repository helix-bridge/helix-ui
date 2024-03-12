import { TokenCategory, TokenSymbol } from "./token";
import { BridgeCategory, LnBridgeCategory, LnBridgeVersion } from "./bridge";
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
  sendTokenAddress: Address;
  recvTokenAddress: Address | null;
  guardSignatures: string | null;
  relayer: Address | null;
  endTxHash: Hex | null;
  confirmedBlocks: string | null;
}

export interface LnBridgeRelayInfo {
  id: string;
  version: LnBridgeVersion;
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
  transferLimit: string | null;
}

export interface SupportChains {
  fromChain: Network;
  toChains: Network[];
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

export interface SortedLnBridgeRelayInfosReqParams {
  amount: string;
  decimals?: number;
  bridge?: BridgeCategory;
  token?: Address;
  fromChain?: Network;
  toChain?: Network;
}

export interface SortedLnBridgeRelayInfosResData {
  sortedLnBridgeRelayInfos: {
    transferLimit: string;
    records: Pick<
      LnBridgeRelayInfo,
      | "relayer"
      | "margin"
      | "baseFee"
      | "protocolFee"
      | "liquidityFeeRate"
      | "lastTransferId"
      | "withdrawNonce"
      | "bridge"
    >[];
  } | null;
}

export type LnBridgeRelayerOverview = Pick<
  LnBridgeRelayInfo,
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
  | "lastTransferId"
  | "withdrawNonce"
  | "transferLimit"
>;

export interface QueryLnBridgeRelayInfosReqParams {
  fromChain?: Network;
  toChain?: Network;
  relayer?: string;
  bridge?: BridgeCategory;
  version?: LnBridgeVersion;
  row: number;
  page: number;
}

export interface QueryLnBridgeRelayInfosResData {
  queryLnBridgeRelayInfos: {
    total: number;
    records: LnBridgeRelayerOverview[];
  } | null;
}

export interface HistoryRecordByTxHashReqParams {
  txHash: Hex;
}

export interface HistoryRecordByTxHashResData {
  historyRecordByTxHash: Pick<HistoryRecord, "confirmedBlocks" | "result" | "id"> | null;
}

export interface CheckLnBridgeExistReqParams {
  fromChainId: ChainID | undefined;
  toChainId: ChainID | undefined;
  fromToken: Address | undefined;
  toToken: Address | undefined;
  version: string | undefined;
}

export interface CheckLnBridgeExistResData {
  checkLnBridgeExist: boolean | null;
}

export interface LnV3MessageChannelReqParams {
  bridge: LnBridgeCategory | null | undefined;
  fromChain: Network | null | undefined;
  toChain: Network | null | undefined;
}

export interface LnV3MessageChannelResData {
  queryLnBridgeRelayInfos: {
    records: { messageChannel: MessageChannel }[];
  };
}

export interface WithdrawableLiquiditiesReqParams {
  page: number;
  relayer: Address | null | undefined;
  recvTokenAddress: Address | null | undefined;
  fromChain: Network | null | undefined;
  toChain: Network | null | undefined;
}

export interface WithdrawableLiquiditiesResData {
  historyRecords: {
    total: number;
    records: {
      id: string;
      sendAmount: string;
      lastRequestWithdraw: string; // Timestamp in Seconds
    }[];
  };
}

export interface SupportChainsReqParams {
  token: Uppercase<TokenCategory>;
}

export interface SupportChainsResData {
  queryLnBridgeSupportChains: SupportChains[];
}
