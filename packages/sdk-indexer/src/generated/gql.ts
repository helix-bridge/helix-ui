/* eslint-disable */
import * as types from "./graphql";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
const documents = {
  "\n  query AvailableCrossChain($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n":
    types.AvailableCrossChainDocument,
  "\n  query HistoryByTxHash($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      requestTxHash\n      responseTxHash\n      fromChain\n      toChain\n      startTime\n      sendToken\n      sendAmount\n      confirmedBlocks\n      result\n      id\n    }\n  }\n":
    types.HistoryByTxHashDocument,
  "\n  query SortedSolveInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n":
    types.SortedSolveInfoDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query AvailableCrossChain($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n",
): typeof import("./graphql").AvailableCrossChainDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query HistoryByTxHash($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      requestTxHash\n      responseTxHash\n      fromChain\n      toChain\n      startTime\n      sendToken\n      sendAmount\n      confirmedBlocks\n      result\n      id\n    }\n  }\n",
): typeof import("./graphql").HistoryByTxHashDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query SortedSolveInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n",
): typeof import("./graphql").SortedSolveInfoDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
