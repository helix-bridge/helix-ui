import { TokenCategory, TokenSymbol } from "./token";
import { BridgeCategory, BridgeVersion } from "./bridge";
import { Network, ChainID } from "./chain";
import { Address, Hash } from "viem";

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
  requestTxHash: Hash;
  responseTxHash: Hash | null;
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
  relayer: Address | null;
  endTxHash: Hash | null;
  confirmedBlocks: string | null;
}

export interface LnBridgeRelayInfo {
  id: string;
  version: BridgeVersion;
  nonce: string;
  targetNonce: string | null;
  fromChain: Network;
  toChain: Network;
  bridge: BridgeCategory;
  relayer: Address;
  sendToken: Address | null;
  transaction_hash: Hash;
  timestamp: number;
  margin: string | null;
  protocolFee: string | null;
  baseFee: string | null;
  liquidityFeeRate: number | null;
  slashCount: number | null;
  withdrawNonce: string | null;
  lastTransferId: Hash | null;
  cost: string | null;
  profit: string | null;
  heartbeatTimestamp: number | null;
  messageChannel: MessageChannel | null;
  transferLimit: string | null;
  signers: string | null;
}

export interface SupportChains {
  fromChain: Network;
  toChains: Network[];
}

/**
 * Custom
 */

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
  version?: BridgeVersion;
  row: number;
  page: number;
}

export interface QueryLnBridgeRelayInfosResData {
  queryLnBridgeRelayInfos: {
    total: number;
    records: LnBridgeRelayerOverview[];
  } | null;
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
  bridge: BridgeCategory | null | undefined;
  fromChain: Network | null | undefined;
  toChain: Network | null | undefined;
}

export interface LnV3MessageChannelResData {
  queryLnBridgeRelayInfos: {
    records: { messageChannel: MessageChannel }[];
  };
}

export interface WithdrawableLiquiditiesReqParams {
  row: number;
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

export interface SupportedChainsReqParams {
  tokenKey: Uppercase<TokenCategory>;
}

interface TokenInfo {
  tokenKey: Uppercase<string>;
  chains: SupportChains[];
}

export interface SupportedChainsResData {
  queryLnBridgeSupportedChains: TokenInfo[];
}

export interface MaxTransferReqParams {
  fromChain: Network;
  toChain: Network;
  token: Address;
  balance: string;
}

export type MaxTransferResData = {
  queryMaxTransfer: string;
};

export interface HistoryReqParams {
  bridges: BridgeCategory[];
  sender: Address | undefined;
  page: number;
  row: number;
}

export interface HistoryResData {
  historyRecords: {
    total: number;
    records: Pick<
      HistoryRecord,
      | "requestTxHash"
      | "responseTxHash"
      | "fromChain"
      | "toChain"
      | "startTime"
      | "sendToken"
      | "sendAmount"
      | "confirmedBlocks"
      | "result"
      | "id"
    >[];
  };
}

export interface HistoryDetailsReqParams {
  txHash: string;
}

export interface HistoryDetailsResData {
  historyRecordByTxHash: Pick<
    HistoryRecord,
    | "requestTxHash"
    | "responseTxHash"
    | "fromChain"
    | "toChain"
    | "startTime"
    | "sendToken"
    | "sendAmount"
    | "confirmedBlocks"
    | "result"
    | "id"
  > | null;
}

export interface TxsReqParams {
  bridges: BridgeCategory[];
  sender: string;
  page: number;
  row: number;
}

export interface TxsResData {
  historyRecords: {
    total: number;
    records: Pick<
      HistoryRecord,
      | "id"
      | "fromChain"
      | "toChain"
      | "sender"
      | "recipient"
      | "sendAmount"
      | "sendToken"
      | "startTime"
      | "result"
      | "confirmedBlocks"
    >[];
  };
}

export type RelayersRecord = Pick<
  LnBridgeRelayInfo,
  | "id"
  | "fromChain"
  | "toChain"
  | "bridge"
  | "relayer"
  | "sendToken"
  | "margin"
  | "baseFee"
  | "liquidityFeeRate"
  | "cost"
  | "profit"
  | "heartbeatTimestamp"
  | "messageChannel"
  | "lastTransferId"
  | "withdrawNonce"
  | "transferLimit"
  | "signers"
>;

export interface RelayersReqParams {
  fromChain?: Network;
  toChain?: Network;
  version: BridgeVersion;
  relayer?: string;
  page: number;
  row: number;
}

export interface RelayersResData {
  queryLnBridgeRelayInfos: {
    total: number;
    records: RelayersRecord[];
  };
}
