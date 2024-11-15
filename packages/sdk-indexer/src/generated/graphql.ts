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

export type AvailableCrossChainQueryVariables = Exact<{
  tokenKey: Scalars["String"]["input"];
}>;

export type AvailableCrossChainQuery = {
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

export type HistoryByTxHashQueryVariables = Exact<{
  txHash?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type HistoryByTxHashQuery = {
  __typename?: "Query";
  historyRecordByTxHash?: {
    __typename?: "HistoryRecord";
    requestTxHash: string;
    responseTxHash?: string | null;
    fromChain: string;
    toChain: string;
    startTime: number;
    sendToken: string;
    sendAmount: string;
    confirmedBlocks?: string | null;
    result: number;
    id: string;
  } | null;
};

export type SortedSolveInfoQueryVariables = Exact<{
  amount?: InputMaybe<Scalars["String"]["input"]>;
  decimals?: InputMaybe<Scalars["Int"]["input"]>;
  token?: InputMaybe<Scalars["String"]["input"]>;
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type SortedSolveInfoQuery = {
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

export const AvailableCrossChainDocument = new TypedDocumentString(`
    query AvailableCrossChain($tokenKey: String!) {
  queryLnBridgeSupportedChains(tokenKey: $tokenKey) {
    tokenKey
    chains {
      fromChain
      toChains
    }
  }
}
    `) as unknown as TypedDocumentString<AvailableCrossChainQuery, AvailableCrossChainQueryVariables>;
export const HistoryByTxHashDocument = new TypedDocumentString(`
    query HistoryByTxHash($txHash: String) {
  historyRecordByTxHash(txHash: $txHash) {
    requestTxHash
    responseTxHash
    fromChain
    toChain
    startTime
    sendToken
    sendAmount
    confirmedBlocks
    result
    id
  }
}
    `) as unknown as TypedDocumentString<HistoryByTxHashQuery, HistoryByTxHashQueryVariables>;
export const SortedSolveInfoDocument = new TypedDocumentString(`
    query SortedSolveInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {
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
    `) as unknown as TypedDocumentString<SortedSolveInfoQuery, SortedSolveInfoQueryVariables>;
