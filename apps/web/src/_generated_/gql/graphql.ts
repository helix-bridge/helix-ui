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

export type QueryRelayersSendTokenQueryVariables = Exact<{
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
  relayer?: InputMaybe<Scalars["String"]["input"]>;
  row?: InputMaybe<Scalars["Int"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  version?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type QueryRelayersSendTokenQuery = {
  __typename?: "Query";
  queryLnBridgeRelayInfos?: {
    __typename?: "LnBridgeRelayInfos";
    records?: Array<{ __typename?: "LnBridgeRelayInfo"; sendToken?: string | null } | null> | null;
  } | null;
};

export type QuerySupportedTransfersQueryVariables = Exact<{
  tokenKey: Scalars["String"]["input"];
}>;

export type QuerySupportedTransfersQuery = {
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

export type QueryExplorerTxByIdQueryVariables = Exact<{
  id: Scalars["String"]["input"];
}>;

export type QueryExplorerTxByIdQuery = {
  __typename?: "Query";
  historyRecordById?: {
    __typename?: "HistoryRecord";
    sendAmount: string;
    recvAmount?: string | null;
    bridge: string;
    endTime?: number | null;
    fee: string;
    feeToken: string;
    fromChain: string;
    id: string;
    nonce: any;
    messageNonce?: string | null;
    recipient: string;
    requestTxHash: string;
    responseTxHash?: string | null;
    reason?: string | null;
    result: number;
    sender: string;
    startTime: number;
    toChain: string;
    sendToken: string;
    recvToken: string;
    sendTokenAddress?: string | null;
    recvTokenAddress?: string | null;
    relayer?: string | null;
  } | null;
};

export type QueryExplorerTxsQueryVariables = Exact<{
  bridges?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>> | InputMaybe<Scalars["String"]["input"]>>;
  sender?: InputMaybe<Scalars["String"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  row?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type QueryExplorerTxsQuery = {
  __typename?: "Query";
  historyRecords?: {
    __typename?: "HistoryRecords";
    total: number;
    records?: Array<{
      __typename?: "HistoryRecord";
      id: string;
      fromChain: string;
      toChain: string;
      sender: string;
      recipient: string;
      sendAmount: string;
      sendToken: string;
      startTime: number;
      result: number;
      confirmedBlocks?: string | null;
    } | null> | null;
  } | null;
};

export type QueryHistoriesQueryVariables = Exact<{
  bridges?: InputMaybe<Array<InputMaybe<Scalars["String"]["input"]>> | InputMaybe<Scalars["String"]["input"]>>;
  sender?: InputMaybe<Scalars["String"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  row?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type QueryHistoriesQuery = {
  __typename?: "Query";
  historyRecords?: {
    __typename?: "HistoryRecords";
    total: number;
    records?: Array<{
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
    } | null> | null;
  } | null;
};

export type QueryHistoryDetailsQueryVariables = Exact<{
  txHash?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type QueryHistoryDetailsQuery = {
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

export type QueryMaxTransferQueryVariables = Exact<{
  token?: InputMaybe<Scalars["String"]["input"]>;
  balance?: InputMaybe<Scalars["String"]["input"]>;
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type QueryMaxTransferQuery = { __typename?: "Query"; queryMaxTransfer?: any | null };

export type QueryRelayersDataQueryVariables = Exact<{
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
  relayer?: InputMaybe<Scalars["String"]["input"]>;
  version?: InputMaybe<Scalars["String"]["input"]>;
  page?: InputMaybe<Scalars["Int"]["input"]>;
  row?: InputMaybe<Scalars["Int"]["input"]>;
}>;

export type QueryRelayersDataQuery = {
  __typename?: "Query";
  queryLnBridgeRelayInfos?: {
    __typename?: "LnBridgeRelayInfos";
    total: number;
    records?: Array<{
      __typename?: "LnBridgeRelayInfo";
      id: string;
      fromChain: string;
      toChain: string;
      bridge: string;
      relayer: string;
      sendToken?: string | null;
      margin?: string | null;
      baseFee?: string | null;
      liquidityFeeRate?: number | null;
      cost?: string | null;
      profit?: string | null;
      heartbeatTimestamp?: number | null;
      messageChannel?: string | null;
      lastTransferId?: string | null;
      withdrawNonce?: any | null;
      transferLimit?: string | null;
      signers?: string | null;
    } | null> | null;
  } | null;
};

export type QuerySortedRelayersQueryVariables = Exact<{
  amount?: InputMaybe<Scalars["String"]["input"]>;
  decimals?: InputMaybe<Scalars["Int"]["input"]>;
  bridge?: InputMaybe<Scalars["String"]["input"]>;
  token?: InputMaybe<Scalars["String"]["input"]>;
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type QuerySortedRelayersQuery = {
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

export type QueryWithdrawableLiquiditiesQueryVariables = Exact<{
  row: Scalars["Int"]["input"];
  page: Scalars["Int"]["input"];
  relayer?: InputMaybe<Scalars["String"]["input"]>;
  recvTokenAddress?: InputMaybe<Scalars["String"]["input"]>;
  fromChain?: InputMaybe<Scalars["String"]["input"]>;
  toChain?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type QueryWithdrawableLiquiditiesQuery = {
  __typename?: "Query";
  historyRecords?: {
    __typename?: "HistoryRecords";
    total: number;
    records?: Array<{
      __typename?: "HistoryRecord";
      id: string;
      sendAmount: string;
      lastRequestWithdraw?: any | null;
    } | null> | null;
  } | null;
};

export type CheckLnBridgeExistQueryVariables = Exact<{
  fromChainId?: InputMaybe<Scalars["Int"]["input"]>;
  toChainId?: InputMaybe<Scalars["Int"]["input"]>;
  fromToken?: InputMaybe<Scalars["String"]["input"]>;
  toToken?: InputMaybe<Scalars["String"]["input"]>;
  version?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type CheckLnBridgeExistQuery = { __typename?: "Query"; checkLnBridgeExist?: boolean | null };

export const QueryRelayersSendTokenDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryRelayersSendToken" },
      variableDefinitions: [
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
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "relayer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "row" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
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
            name: { kind: "Name", value: "queryLnBridgeRelayInfos" },
            arguments: [
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
              {
                kind: "Argument",
                name: { kind: "Name", value: "relayer" },
                value: { kind: "Variable", name: { kind: "Name", value: "relayer" } },
              },
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
                name: { kind: "Name", value: "version" },
                value: { kind: "Variable", name: { kind: "Name", value: "version" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "records" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "sendToken" } }],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QueryRelayersSendTokenQuery, QueryRelayersSendTokenQueryVariables>;
export const QuerySupportedTransfersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QuerySupportedTransfers" },
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
} as unknown as DocumentNode<QuerySupportedTransfersQuery, QuerySupportedTransfersQueryVariables>;
export const QueryExplorerTxByIdDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryExplorerTxById" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: { kind: "NonNullType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
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
                { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                { kind: "Field", name: { kind: "Name", value: "recvAmount" } },
                { kind: "Field", name: { kind: "Name", value: "bridge" } },
                { kind: "Field", name: { kind: "Name", value: "endTime" } },
                { kind: "Field", name: { kind: "Name", value: "fee" } },
                { kind: "Field", name: { kind: "Name", value: "feeToken" } },
                { kind: "Field", name: { kind: "Name", value: "fromChain" } },
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "nonce" } },
                { kind: "Field", name: { kind: "Name", value: "messageNonce" } },
                { kind: "Field", name: { kind: "Name", value: "recipient" } },
                { kind: "Field", name: { kind: "Name", value: "requestTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "responseTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "reason" } },
                { kind: "Field", name: { kind: "Name", value: "result" } },
                { kind: "Field", name: { kind: "Name", value: "sender" } },
                { kind: "Field", name: { kind: "Name", value: "startTime" } },
                { kind: "Field", name: { kind: "Name", value: "toChain" } },
                { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                { kind: "Field", name: { kind: "Name", value: "recvToken" } },
                { kind: "Field", name: { kind: "Name", value: "sendTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "recvTokenAddress" } },
                { kind: "Field", name: { kind: "Name", value: "relayer" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QueryExplorerTxByIdQuery, QueryExplorerTxByIdQueryVariables>;
export const QueryExplorerTxsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryExplorerTxs" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "bridges" } },
          type: { kind: "ListType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sender" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "row" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
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
                name: { kind: "Name", value: "bridges" },
                value: { kind: "Variable", name: { kind: "Name", value: "bridges" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sender" },
                value: { kind: "Variable", name: { kind: "Name", value: "sender" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: { kind: "Variable", name: { kind: "Name", value: "page" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "row" },
                value: { kind: "Variable", name: { kind: "Name", value: "row" } },
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
                      { kind: "Field", name: { kind: "Name", value: "sender" } },
                      { kind: "Field", name: { kind: "Name", value: "recipient" } },
                      { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                      { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                      { kind: "Field", name: { kind: "Name", value: "startTime" } },
                      { kind: "Field", name: { kind: "Name", value: "result" } },
                      { kind: "Field", name: { kind: "Name", value: "confirmedBlocks" } },
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
} as unknown as DocumentNode<QueryExplorerTxsQuery, QueryExplorerTxsQueryVariables>;
export const QueryHistoriesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryHistories" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "bridges" } },
          type: { kind: "ListType", type: { kind: "NamedType", name: { kind: "Name", value: "String" } } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sender" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "row" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
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
                name: { kind: "Name", value: "bridges" },
                value: { kind: "Variable", name: { kind: "Name", value: "bridges" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "sender" },
                value: { kind: "Variable", name: { kind: "Name", value: "sender" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: { kind: "Variable", name: { kind: "Name", value: "page" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "row" },
                value: { kind: "Variable", name: { kind: "Name", value: "row" } },
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
                      { kind: "Field", name: { kind: "Name", value: "requestTxHash" } },
                      { kind: "Field", name: { kind: "Name", value: "responseTxHash" } },
                      { kind: "Field", name: { kind: "Name", value: "fromChain" } },
                      { kind: "Field", name: { kind: "Name", value: "toChain" } },
                      { kind: "Field", name: { kind: "Name", value: "startTime" } },
                      { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                      { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                      { kind: "Field", name: { kind: "Name", value: "confirmedBlocks" } },
                      { kind: "Field", name: { kind: "Name", value: "result" } },
                      { kind: "Field", name: { kind: "Name", value: "id" } },
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
} as unknown as DocumentNode<QueryHistoriesQuery, QueryHistoriesQueryVariables>;
export const QueryHistoryDetailsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryHistoryDetails" },
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
                { kind: "Field", name: { kind: "Name", value: "requestTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "responseTxHash" } },
                { kind: "Field", name: { kind: "Name", value: "fromChain" } },
                { kind: "Field", name: { kind: "Name", value: "toChain" } },
                { kind: "Field", name: { kind: "Name", value: "startTime" } },
                { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                { kind: "Field", name: { kind: "Name", value: "confirmedBlocks" } },
                { kind: "Field", name: { kind: "Name", value: "result" } },
                { kind: "Field", name: { kind: "Name", value: "id" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<QueryHistoryDetailsQuery, QueryHistoryDetailsQueryVariables>;
export const QueryMaxTransferDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryMaxTransfer" },
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
} as unknown as DocumentNode<QueryMaxTransferQuery, QueryMaxTransferQueryVariables>;
export const QueryRelayersDataDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryRelayersData" },
      variableDefinitions: [
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
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "relayer" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "version" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "row" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "queryLnBridgeRelayInfos" },
            arguments: [
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
              {
                kind: "Argument",
                name: { kind: "Name", value: "relayer" },
                value: { kind: "Variable", name: { kind: "Name", value: "relayer" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "version" },
                value: { kind: "Variable", name: { kind: "Name", value: "version" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: { kind: "Variable", name: { kind: "Name", value: "page" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "row" },
                value: { kind: "Variable", name: { kind: "Name", value: "row" } },
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
                      { kind: "Field", name: { kind: "Name", value: "relayer" } },
                      { kind: "Field", name: { kind: "Name", value: "sendToken" } },
                      { kind: "Field", name: { kind: "Name", value: "margin" } },
                      { kind: "Field", name: { kind: "Name", value: "baseFee" } },
                      { kind: "Field", name: { kind: "Name", value: "liquidityFeeRate" } },
                      { kind: "Field", name: { kind: "Name", value: "cost" } },
                      { kind: "Field", name: { kind: "Name", value: "profit" } },
                      { kind: "Field", name: { kind: "Name", value: "heartbeatTimestamp" } },
                      { kind: "Field", name: { kind: "Name", value: "messageChannel" } },
                      { kind: "Field", name: { kind: "Name", value: "lastTransferId" } },
                      { kind: "Field", name: { kind: "Name", value: "withdrawNonce" } },
                      { kind: "Field", name: { kind: "Name", value: "transferLimit" } },
                      { kind: "Field", name: { kind: "Name", value: "signers" } },
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
} as unknown as DocumentNode<QueryRelayersDataQuery, QueryRelayersDataQueryVariables>;
export const QuerySortedRelayersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QuerySortedRelayers" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "bridge" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
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
                name: { kind: "Name", value: "bridge" },
                value: { kind: "Variable", name: { kind: "Name", value: "bridge" } },
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
} as unknown as DocumentNode<QuerySortedRelayersQuery, QuerySortedRelayersQueryVariables>;
export const QueryWithdrawableLiquiditiesDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "QueryWithdrawableLiquidities" },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "recvTokenAddress" } },
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
                value: { kind: "Variable", name: { kind: "Name", value: "recvTokenAddress" } },
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
                      { kind: "Field", name: { kind: "Name", value: "sendAmount" } },
                      { kind: "Field", name: { kind: "Name", value: "lastRequestWithdraw" } },
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
} as unknown as DocumentNode<QueryWithdrawableLiquiditiesQuery, QueryWithdrawableLiquiditiesQueryVariables>;
export const CheckLnBridgeExistDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "checkLnBridgeExist" },
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
} as unknown as DocumentNode<CheckLnBridgeExistQuery, CheckLnBridgeExistQueryVariables>;
