import { TokenSymbol } from "./token";
import { BridgeCategory, BridgeVersion } from "./bridge";
import { Network } from "./chain";
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
