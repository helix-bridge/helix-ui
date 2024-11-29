/* eslint-disable */
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values.BigInt can represent values between -(2^63) + 1 and 2^63 - 1. */
  BigInt: { input: any; output: any };
};

export type CurrentlyAvailableCrossChainQueryVariables = Exact<{
  tokenKey: Scalars["String"]["input"];
}>;

export type CurrentlyAvailableCrossChainQuery = {
  __typename?: "Query";
  queryLnBridgeSupportedChains?: Array<{
    __typename?: "TokenInfo";
    tokenKey: string;
    chains?: Array<{
      __typename?: "SupportChains";
      fromChain: string;
      toChains?: Array<string | null> | null;
    } | null> | null;
  } | null> | null;
};

export type HistoryTxByHashQueryVariables = Exact<{
  txHash?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type HistoryTxByHashQuery = {
  __typename?: "Query";
  historyRecordByTxHash?: {
    __typename?: "HistoryRecord";
    id: string;
    fromChain: string;
    toChain: string;
    bridge: string;
    reason?: string | null;
    nonce: any;
    requestTxHash: string;
    responseTxHash?: string | null;
    sender: string;
    recipient: string;
    sendToken: string;
    recvToken: string;
    sendAmount: string;
    recvAmount?: string | null;
    startTime: number;
    endTime?: number | null;
    result: number;
    fee: string;
    feeToken: string;
    messageNonce?: string | null;
    sendTokenAddress?: string | null;
    recvTokenAddress?: string | null;
    sendOuterTokenAddress?: string | null;
    recvOuterTokenAddress?: string | null;
    guardSignatures?: string | null;
    relayer?: string | null;
    endTxHash?: string | null;
    confirmedBlocks?: string | null;
    needWithdrawLiquidity?: boolean | null;
    lastRequestWithdraw?: any | null;
    extData?: string | null;
  } | null;
};

export type HistoryTxByIdQueryVariables = Exact<{
  id?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type HistoryTxByIdQuery = {
  __typename?: "Query";
  historyRecordById?: {
    __typename?: "HistoryRecord";
    id: string;
    fromChain: string;
    toChain: string;
    bridge: string;
    reason?: string | null;
    nonce: any;
    requestTxHash: string;
    responseTxHash?: string | null;
    sender: string;
    recipient: string;
    sendToken: string;
    recvToken: string;
    sendAmount: string;
    recvAmount?: string | null;
    startTime: number;
    endTime?: number | null;
    result: number;
    fee: string;
    feeToken: string;
    messageNonce?: string | null;
    sendTokenAddress?: string | null;
    recvTokenAddress?: string | null;
    sendOuterTokenAddress?: string | null;
    recvOuterTokenAddress?: string | null;
    guardSignatures?: string | null;
    relayer?: string | null;
    endTxHash?: string | null;
    confirmedBlocks?: string | null;
    needWithdrawLiquidity?: boolean | null;
    lastRequestWithdraw?: any | null;
    extData?: string | null;
  } | null;
};

export type MaxTransferQueryVariables = Exact<{
  token?: InputMaybe<Scalars["String"]["input"]>;
  balance?: InputMaybe<Scalars["String"]["input"]>;
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type MaxTransferQuery = { __typename?: "Query"; queryMaxTransfer?: any | null };

export type SortedRelayInfoQueryVariables = Exact<{
  amount?: InputMaybe<Scalars["String"]["input"]>;
  decimals?: InputMaybe<Scalars["Int"]["input"]>;
  token?: InputMaybe<Scalars["String"]["input"]>;
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SortedRelayInfoQuery = {
  __typename?: "Query";
  sortedLnBridgeRelayInfos?: {
    __typename?: "SortedLnBridgeRelayInfos";
    transferLimit: any;
    records?: Array<{
      __typename?: "LnBridgeRelayInfo";
      sendToken?: string | null;
      relayer: string;
      margin?: string | null;
      baseFee?: string | null;
      protocolFee?: string | null;
      liquidityFeeRate?: number | null;
      lastTransferId?: string | null;
      withdrawNonce?: any | null;
      bridge: string;
    } | null> | null;
  } | null;
};

export type WithdrawableTXsQueryVariables = Exact<{
  row: Scalars["Int"]["input"];
  page: Scalars["Int"]["input"];
  relayer?: InputMaybe<Scalars["String"]["input"]>;
  toToken?: InputMaybe<Scalars["String"]["input"]>;
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type WithdrawableTXsQuery = {
  __typename?: "Query";
  historyRecords?: {
    __typename?: "HistoryRecords";
    total: number;
    records?: Array<{
      __typename?: "HistoryRecord";
      id: string;
      fromChain: string;
      toChain: string;
      bridge: string;
      reason?: string | null;
      nonce: any;
      requestTxHash: string;
      responseTxHash?: string | null;
      sender: string;
      recipient: string;
      sendToken: string;
      recvToken: string;
      sendAmount: string;
      recvAmount?: string | null;
      startTime: number;
      endTime?: number | null;
      result: number;
      fee: string;
      feeToken: string;
      messageNonce?: string | null;
      sendTokenAddress?: string | null;
      recvTokenAddress?: string | null;
      sendOuterTokenAddress?: string | null;
      recvOuterTokenAddress?: string | null;
      guardSignatures?: string | null;
      relayer?: string | null;
      endTxHash?: string | null;
      confirmedBlocks?: string | null;
      needWithdrawLiquidity?: boolean | null;
      lastRequestWithdraw?: any | null;
      extData?: string | null;
    } | null> | null;
  } | null;
};

export type LnBridgeExistQueryVariables = Exact<{
  fromChainId?: InputMaybe<Scalars["Int"]["input"]>;
  toChainId?: InputMaybe<Scalars["Int"]["input"]>;
  fromToken?: InputMaybe<Scalars["String"]["input"]>;
  toToken?: InputMaybe<Scalars["String"]["input"]>;
  version?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type LnBridgeExistQuery = { __typename?: "Query"; checkLnBridgeExist?: boolean | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: DocumentTypeDecoration<TResult, TVariables>["__apiType"];

  constructor(
    private value: string,
    public __meta__?: Record<string, any> | undefined,
  ) {
    super(value);
  }

  toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const CurrentlyAvailableCrossChainDocument = new TypedDocumentString(`
    query CurrentlyAvailableCrossChain($tokenKey: String!) {
  queryLnBridgeSupportedChains(tokenKey: $tokenKey) {
    tokenKey
    chains {
      fromChain
      toChains
    }
  }
}
    `) as unknown as TypedDocumentString<CurrentlyAvailableCrossChainQuery, CurrentlyAvailableCrossChainQueryVariables>;
export const HistoryTxByHashDocument = new TypedDocumentString(`
    query HistoryTxByHash($txHash: String) {
  historyRecordByTxHash(txHash: $txHash) {
    id
    fromChain
    toChain
    bridge
    reason
    nonce
    requestTxHash
    responseTxHash
    sender
    recipient
    sendToken
    recvToken
    sendAmount
    recvAmount
    startTime
    endTime
    result
    fee
    feeToken
    messageNonce
    sendTokenAddress
    recvTokenAddress
    sendOuterTokenAddress
    recvOuterTokenAddress
    guardSignatures
    relayer
    endTxHash
    confirmedBlocks
    needWithdrawLiquidity
    lastRequestWithdraw
    extData
  }
}
    `) as unknown as TypedDocumentString<HistoryTxByHashQuery, HistoryTxByHashQueryVariables>;
export const HistoryTxByIdDocument = new TypedDocumentString(`
    query HistoryTxById($id: String) {
  historyRecordById(id: $id) {
    id
    fromChain
    toChain
    bridge
    reason
    nonce
    requestTxHash
    responseTxHash
    sender
    recipient
    sendToken
    recvToken
    sendAmount
    recvAmount
    startTime
    endTime
    result
    fee
    feeToken
    messageNonce
    sendTokenAddress
    recvTokenAddress
    sendOuterTokenAddress
    recvOuterTokenAddress
    guardSignatures
    relayer
    endTxHash
    confirmedBlocks
    needWithdrawLiquidity
    lastRequestWithdraw
    extData
  }
}
    `) as unknown as TypedDocumentString<HistoryTxByIdQuery, HistoryTxByIdQueryVariables>;
export const MaxTransferDocument = new TypedDocumentString(`
    query MaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {
  queryMaxTransfer(
    token: $token
    balance: $balance
    fromChain: $fromChain
    toChain: $toChain
  )
}
    `) as unknown as TypedDocumentString<MaxTransferQuery, MaxTransferQueryVariables>;
export const SortedRelayInfoDocument = new TypedDocumentString(`
    query SortedRelayInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {
  sortedLnBridgeRelayInfos(
    amount: $amount
    decimals: $decimals
    token: $token
    fromChain: $fromChain
    toChain: $toChain
  ) {
    transferLimit
    records {
      sendToken
      relayer
      margin
      baseFee
      protocolFee
      liquidityFeeRate
      lastTransferId
      withdrawNonce
      bridge
    }
  }
}
    `) as unknown as TypedDocumentString<SortedRelayInfoQuery, SortedRelayInfoQueryVariables>;
export const WithdrawableTXsDocument = new TypedDocumentString(`
    query WithdrawableTXs($row: Int!, $page: Int!, $relayer: String = "", $toToken: String = "", $fromChain: String = "", $toChain: String = "") {
  historyRecords(
    row: $row
    page: $page
    relayer: $relayer
    recvTokenAddress: $toToken
    fromChains: [$fromChain]
    toChains: [$toChain]
    needWithdrawLiquidity: true
  ) {
    total
    records {
      id
      fromChain
      toChain
      bridge
      reason
      nonce
      requestTxHash
      responseTxHash
      sender
      recipient
      sendToken
      recvToken
      sendAmount
      recvAmount
      startTime
      endTime
      result
      fee
      feeToken
      messageNonce
      sendTokenAddress
      recvTokenAddress
      sendOuterTokenAddress
      recvOuterTokenAddress
      guardSignatures
      relayer
      endTxHash
      confirmedBlocks
      needWithdrawLiquidity
      lastRequestWithdraw
      extData
    }
  }
}
    `) as unknown as TypedDocumentString<WithdrawableTXsQuery, WithdrawableTXsQueryVariables>;
export const LnBridgeExistDocument = new TypedDocumentString(`
    query LnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {
  checkLnBridgeExist(
    fromChainId: $fromChainId
    toChainId: $toChainId
    fromToken: $fromToken
    toToken: $toToken
    version: $version
  )
}
    `) as unknown as TypedDocumentString<LnBridgeExistQuery, LnBridgeExistQueryVariables>;
