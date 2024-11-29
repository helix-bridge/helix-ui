/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
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

export const CurrentlyAvailableCrossChainDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "CurrentlyAvailableCrossChain" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "tokenKey" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "queryLnBridgeSupportedChains" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "tokenKey" },
                value: { kind: "Variable", name: { kind: "Name", value: "tokenKey" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "tokenKey" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "chains" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "fromChain" } },
                      { kind: "Field", name: { kind: "Name", value: "toChains" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CurrentlyAvailableCrossChainQuery, CurrentlyAvailableCrossChainQueryVariables>;
export const HistoryTxByHashDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "HistoryTxByHash" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "txHash" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "historyRecordByTxHash" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "txHash" },
                value: { kind: "Variable", name: { kind: "Name", value: "txHash" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "fromChain" } },
                { kind: "Field", name: { kind: "Name", value: "toChain" } },
                { kind: "Field", name: { kind: "Name", value: "bridge" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "nonce" } },
                { kind: "Field", name: { kind: "Name", value: "requestTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "responseTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "sender" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                { kind: "Field", name: { kind: "Name", value: "recvToken" } },
                { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                { kind: "Field", name: { kind: "Name", value: "recvAmount" } },
                { kind: "Field", name: { kind: "Name", value: "startTime" } },
                { kind: "Field", name: { kind: "Name", value: "endTime" } },
                { kind: "Field", name: { kind: "Name", value: "result" } },
                { kind: "Field", name: { kind: "Name", value: "fee" } },
                { kind: "Field", name: { kind: "Name", value: "feeToken" } },
                { kind: "Field", name: { kind: "Name", value: "messageNonce" } },
                { kind: "Field", name: { kind: "Name", value: "sendTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "recvTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "sendOuterTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "recvOuterTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "guardSignatures" } },
                { kind: "Field", name: { kind: "Name", value: "relayer" } },
                { kind: "Field", name: { kind: "Name", value: "endTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "confirmedBlocks" } },
                { kind: "Field", name: { kind: "Name", value: "needWithdrawLiquidity" } },
                { kind: "Field", name: { kind: "Name", value: "lastRequestWithdraw" } },
                { kind: "Field", name: { kind: "Name", value: "extData" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HistoryTxByHashQuery, HistoryTxByHashQueryVariables>;
export const HistoryTxByIdDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "HistoryTxById" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "historyRecordById" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "fromChain" } },
                { kind: "Field", name: { kind: "Name", value: "toChain" } },
                { kind: "Field", name: { kind: "Name", value: "bridge" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "nonce" } },
                { kind: "Field", name: { kind: "Name", value: "requestTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "responseTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "sender" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                { kind: "Field", name: { kind: "Name", value: "recvToken" } },
                { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                { kind: "Field", name: { kind: "Name", value: "recvAmount" } },
                { kind: "Field", name: { kind: "Name", value: "startTime" } },
                { kind: "Field", name: { kind: "Name", value: "endTime" } },
                { kind: "Field", name: { kind: "Name", value: "result" } },
                { kind: "Field", name: { kind: "Name", value: "fee" } },
                { kind: "Field", name: { kind: "Name", value: "feeToken" } },
                { kind: "Field", name: { kind: "Name", value: "messageNonce" } },
                { kind: "Field", name: { kind: "Name", value: "sendTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "recvTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "sendOuterTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "recvOuterTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "guardSignatures" } },
                { kind: "Field", name: { kind: "Name", value: "relayer" } },
                { kind: "Field", name: { kind: "Name", value: "endTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "confirmedBlocks" } },
                { kind: "Field", name: { kind: "Name", value: "needWithdrawLiquidity" } },
                { kind: "Field", name: { kind: "Name", value: "lastRequestWithdraw" } },
                { kind: "Field", name: { kind: "Name", value: "extData" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HistoryTxByIdQuery, HistoryTxByIdQueryVariables>;
export const MaxTransferDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "MaxTransfer" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "token" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "balance" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromChain" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toChain" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "queryMaxTransfer" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "token" },
                value: { kind: "Variable", name: { kind: "Name", value: "token" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "balance" },
                value: { kind: "Variable", name: { kind: "Name", value: "balance" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromChain" },
                value: { kind: "Variable", name: { kind: "Name", value: "fromChain" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toChain" },
                value: { kind: "Variable", name: { kind: "Name", value: "toChain" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MaxTransferQuery, MaxTransferQueryVariables>;
export const SortedRelayInfoDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "SortedRelayInfo" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "amount" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "decimals" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "token" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromChain" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toChain" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "sortedLnBridgeRelayInfos" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "amount" },
                value: { kind: "Variable", name: { kind: "Name", value: "amount" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "decimals" },
                value: { kind: "Variable", name: { kind: "Name", value: "decimals" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "token" },
                value: { kind: "Variable", name: { kind: "Name", value: "token" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromChain" },
                value: { kind: "Variable", name: { kind: "Name", value: "fromChain" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toChain" },
                value: { kind: "Variable", name: { kind: "Name", value: "toChain" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "transferLimit" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "records" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                      { kind: "Field", name: { kind: "Name", value: "relayer" } },
                      { kind: "Field", name: { kind: "Name", value: "margin" } },
                      { kind: "Field", name: { kind: "Name", value: "baseFee" } },
                      { kind: "Field", name: { kind: "Name", value: "protocolFee" } },
                      { kind: "Field", name: { kind: "Name", value: "liquidityFeeRate" } },
                      { kind: "Field", name: { kind: "Name", value: "lastTransferId" } },
                      { kind: "Field", name: { kind: "Name", value: "withdrawNonce" } },
                      { kind: "Field", name: { kind: "Name", value: "bridge" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SortedRelayInfoQuery, SortedRelayInfoQueryVariables>;
export const WithdrawableTXsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "WithdrawableTXs" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "row" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "Int" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "Int" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "relayer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          defaultValue: { kind: "StringValue", value: "", block: false },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toToken" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          defaultValue: { kind: "StringValue", value: "", block: false },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromChain" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          defaultValue: { kind: "StringValue", value: "", block: false },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toChain" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
          defaultValue: { kind: "StringValue", value: "", block: false },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "historyRecords" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "row" },
                value: { kind: "Variable", name: { kind: "Name", value: "row" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: { kind: "Variable", name: { kind: "Name", value: "page" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "relayer" },
                value: { kind: "Variable", name: { kind: "Name", value: "relayer" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "recvTokenAddress" },
                value: { kind: "Variable", name: { kind: "Name", value: "toToken" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromChains" },
                value: {
                  kind: "ListValue",
                  values: [{ kind: "Variable", name: { kind: "Name", value: "fromChain" } }],
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toChains" },
                value: { kind: "ListValue", values: [{ kind: "Variable", name: { kind: "Name", value: "toChain" } }] },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "needWithdrawLiquidity" },
                value: { kind: "BooleanValue", value: true },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "total" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "records" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "fromChain" } },
                      { kind: "Field", name: { kind: "Name", value: "toChain" } },
                      { kind: "Field", name: { kind: "Name", value: "bridge" } },
                      { kind: "Field", name: { kind: "Name", value: "reason" } },
                      { kind: "Field", name: { kind: "Name", value: "nonce" } },
                      { kind: "Field", name: { kind: "Name", value: "requestTxHash" } },
                      { kind: "Field", name: { kind: "Name", value: "responseTxHash" } },
                      { kind: "Field", name: { kind: "Name", value: "sender" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                      { kind: "Field", name: { kind: "Name", value: "recvToken" } },
                      { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                      { kind: "Field", name: { kind: "Name", value: "recvAmount" } },
                      { kind: "Field", name: { kind: "Name", value: "startTime" } },
                      { kind: "Field", name: { kind: "Name", value: "endTime" } },
                      { kind: "Field", name: { kind: "Name", value: "result" } },
                      { kind: "Field", name: { kind: "Name", value: "fee" } },
                      { kind: "Field", name: { kind: "Name", value: "feeToken" } },
                      { kind: "Field", name: { kind: "Name", value: "messageNonce" } },
                      { kind: "Field", name: { kind: "Name", value: "sendTokenAddress" } },
                      { kind: "Field", name: { kind: "Name", value: "recvTokenAddress" } },
                      { kind: "Field", name: { kind: "Name", value: "sendOuterTokenAddress" } },
                      { kind: "Field", name: { kind: "Name", value: "recvOuterTokenAddress" } },
                      { kind: "Field", name: { kind: "Name", value: "guardSignatures" } },
                      { kind: "Field", name: { kind: "Name", value: "relayer" } },
                      { kind: "Field", name: { kind: "Name", value: "endTxHash" } },
                      { kind: "Field", name: { kind: "Name", value: "confirmedBlocks" } },
                      { kind: "Field", name: { kind: "Name", value: "needWithdrawLiquidity" } },
                      { kind: "Field", name: { kind: "Name", value: "lastRequestWithdraw" } },
                      { kind: "Field", name: { kind: "Name", value: "extData" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WithdrawableTXsQuery, WithdrawableTXsQueryVariables>;
export const LnBridgeExistDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "LnBridgeExist" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromChainId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toChainId" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "fromToken" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "toToken" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "version" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "checkLnBridgeExist" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromChainId" },
                value: { kind: "Variable", name: { kind: "Name", value: "fromChainId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toChainId" },
                value: { kind: "Variable", name: { kind: "Name", value: "toChainId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromToken" },
                value: { kind: "Variable", name: { kind: "Name", value: "fromToken" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "toToken" },
                value: { kind: "Variable", name: { kind: "Name", value: "toToken" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "version" },
                value: { kind: "Variable", name: { kind: "Name", value: "version" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LnBridgeExistQuery, LnBridgeExistQueryVariables>;
