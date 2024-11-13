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
  "\n  query SortedRelayers($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n":
    types.SortedRelayersDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query SortedRelayers($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n",
): typeof import("./graphql").SortedRelayersDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
