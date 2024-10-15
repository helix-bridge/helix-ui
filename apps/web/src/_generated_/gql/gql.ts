/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

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
  "\n  query QueryRelayersSendToken(\n    $fromChain: String\n    $toChain: String\n    $relayer: String\n    $row: Int\n    $page: Int\n    $version: String\n  ) {\n    queryLnBridgeRelayInfos(\n      fromChain: $fromChain\n      toChain: $toChain\n      relayer: $relayer\n      row: $row\n      page: $page\n      version: $version\n    ) {\n      records {\n        sendToken\n      }\n    }\n  }  \n":
    types.QueryRelayersSendTokenDocument,
  "\n  query QuerySupportedTransfers($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n":
    types.QuerySupportedTransfersDocument,
  "\n  query QueryExplorerTxById($id: String!) {\n    historyRecordById(id: $id) {\n      sendAmount\n      recvAmount\n      bridge\n      endTime\n      fee\n      feeToken\n      fromChain\n      id\n      nonce\n      messageNonce\n      recipient\n      requestTxHash\n      responseTxHash\n      reason\n      result\n      sender\n      startTime\n      toChain\n      sendToken\n      recvToken\n      sendTokenAddress\n      recvTokenAddress\n      relayer\n    }\n  }\n":
    types.QueryExplorerTxByIdDocument,
  "\n  query QueryExplorerTxs($bridges: [String], $sender: String, $page: Int, $row: Int) {\n    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        sender\n        recipient\n        sendAmount\n        sendToken\n        startTime\n        result\n        confirmedBlocks\n      }\n    }\n  }\n":
    types.QueryExplorerTxsDocument,
  "\n  query QueryHistories($bridges: [String], $sender: String, $page: Int, $row: Int) {\n    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {\n      total\n      records {\n        requestTxHash\n        responseTxHash\n        fromChain\n        toChain\n        startTime\n        sendToken\n        sendAmount\n        confirmedBlocks\n        result\n        id\n      }\n    }\n  }\n":
    types.QueryHistoriesDocument,
  "\n  query QueryHistoryDetails($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      requestTxHash\n      responseTxHash\n      fromChain\n      toChain\n      startTime\n      sendToken\n      sendAmount\n      confirmedBlocks\n      result\n      id\n    }\n  }\n":
    types.QueryHistoryDetailsDocument,
  "\n  query QueryMaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {\n    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)\n  }\n":
    types.QueryMaxTransferDocument,
  "\n  query QueryRelayersData(\n    $fromChain: String\n    $toChain: String\n    $relayer: String\n    $version: String\n    $page: Int\n    $row: Int\n  ) {\n    queryLnBridgeRelayInfos(\n      fromChain: $fromChain\n      toChain: $toChain\n      relayer: $relayer\n      version: $version\n      page: $page\n      row: $row\n    ) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        bridge\n        relayer\n        sendToken\n        margin\n        baseFee\n        liquidityFeeRate\n        cost\n        profit\n        heartbeatTimestamp\n        messageChannel\n        lastTransferId\n        withdrawNonce\n        transferLimit\n        signers\n      }\n    }\n  }\n":
    types.QueryRelayersDataDocument,
  "\n  query QuerySortedRelayers(\n    $amount: String\n    $decimals: Int\n    $bridge: String\n    $token: String\n    $fromChain: String\n    $toChain: String\n  ) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      bridge: $bridge\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n":
    types.QuerySortedRelayersDocument,
  '\n  query QueryWithdrawableLiquidities(\n    $row: Int!\n    $page: Int!\n    $relayer: String = ""\n    $recvTokenAddress: String = ""\n    $fromChain: String = ""\n    $toChain: String = ""\n  ) {\n    historyRecords(\n      row: $row\n      page: $page\n      relayer: $relayer\n      recvTokenAddress: $recvTokenAddress\n      fromChains: [$fromChain]\n      toChains: [$toChain]\n      needWithdrawLiquidity: true\n    ) {\n      total\n      records {\n        id\n        sendAmount\n        lastRequestWithdraw\n      }\n    }\n  }\n':
    types.QueryWithdrawableLiquiditiesDocument,
  "\n  query checkLnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {\n    checkLnBridgeExist(\n      fromChainId: $fromChainId\n      toChainId: $toChainId\n      fromToken: $fromToken\n      toToken: $toToken\n      version: $version\n    )\n  }\n":
    types.CheckLnBridgeExistDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QueryRelayersSendToken(\n    $fromChain: String\n    $toChain: String\n    $relayer: String\n    $row: Int\n    $page: Int\n    $version: String\n  ) {\n    queryLnBridgeRelayInfos(\n      fromChain: $fromChain\n      toChain: $toChain\n      relayer: $relayer\n      row: $row\n      page: $page\n      version: $version\n    ) {\n      records {\n        sendToken\n      }\n    }\n  }  \n",
): (typeof documents)["\n  query QueryRelayersSendToken(\n    $fromChain: String\n    $toChain: String\n    $relayer: String\n    $row: Int\n    $page: Int\n    $version: String\n  ) {\n    queryLnBridgeRelayInfos(\n      fromChain: $fromChain\n      toChain: $toChain\n      relayer: $relayer\n      row: $row\n      page: $page\n      version: $version\n    ) {\n      records {\n        sendToken\n      }\n    }\n  }  \n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QuerySupportedTransfers($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n",
): (typeof documents)["\n  query QuerySupportedTransfers($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QueryExplorerTxById($id: String!) {\n    historyRecordById(id: $id) {\n      sendAmount\n      recvAmount\n      bridge\n      endTime\n      fee\n      feeToken\n      fromChain\n      id\n      nonce\n      messageNonce\n      recipient\n      requestTxHash\n      responseTxHash\n      reason\n      result\n      sender\n      startTime\n      toChain\n      sendToken\n      recvToken\n      sendTokenAddress\n      recvTokenAddress\n      relayer\n    }\n  }\n",
): (typeof documents)["\n  query QueryExplorerTxById($id: String!) {\n    historyRecordById(id: $id) {\n      sendAmount\n      recvAmount\n      bridge\n      endTime\n      fee\n      feeToken\n      fromChain\n      id\n      nonce\n      messageNonce\n      recipient\n      requestTxHash\n      responseTxHash\n      reason\n      result\n      sender\n      startTime\n      toChain\n      sendToken\n      recvToken\n      sendTokenAddress\n      recvTokenAddress\n      relayer\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QueryExplorerTxs($bridges: [String], $sender: String, $page: Int, $row: Int) {\n    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        sender\n        recipient\n        sendAmount\n        sendToken\n        startTime\n        result\n        confirmedBlocks\n      }\n    }\n  }\n",
): (typeof documents)["\n  query QueryExplorerTxs($bridges: [String], $sender: String, $page: Int, $row: Int) {\n    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        sender\n        recipient\n        sendAmount\n        sendToken\n        startTime\n        result\n        confirmedBlocks\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QueryHistories($bridges: [String], $sender: String, $page: Int, $row: Int) {\n    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {\n      total\n      records {\n        requestTxHash\n        responseTxHash\n        fromChain\n        toChain\n        startTime\n        sendToken\n        sendAmount\n        confirmedBlocks\n        result\n        id\n      }\n    }\n  }\n",
): (typeof documents)["\n  query QueryHistories($bridges: [String], $sender: String, $page: Int, $row: Int) {\n    historyRecords(bridges: $bridges, sender: $sender, page: $page, row: $row) {\n      total\n      records {\n        requestTxHash\n        responseTxHash\n        fromChain\n        toChain\n        startTime\n        sendToken\n        sendAmount\n        confirmedBlocks\n        result\n        id\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QueryHistoryDetails($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      requestTxHash\n      responseTxHash\n      fromChain\n      toChain\n      startTime\n      sendToken\n      sendAmount\n      confirmedBlocks\n      result\n      id\n    }\n  }\n",
): (typeof documents)["\n  query QueryHistoryDetails($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      requestTxHash\n      responseTxHash\n      fromChain\n      toChain\n      startTime\n      sendToken\n      sendAmount\n      confirmedBlocks\n      result\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QueryMaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {\n    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)\n  }\n",
): (typeof documents)["\n  query QueryMaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {\n    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QueryRelayersData(\n    $fromChain: String\n    $toChain: String\n    $relayer: String\n    $version: String\n    $page: Int\n    $row: Int\n  ) {\n    queryLnBridgeRelayInfos(\n      fromChain: $fromChain\n      toChain: $toChain\n      relayer: $relayer\n      version: $version\n      page: $page\n      row: $row\n    ) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        bridge\n        relayer\n        sendToken\n        margin\n        baseFee\n        liquidityFeeRate\n        cost\n        profit\n        heartbeatTimestamp\n        messageChannel\n        lastTransferId\n        withdrawNonce\n        transferLimit\n        signers\n      }\n    }\n  }\n",
): (typeof documents)["\n  query QueryRelayersData(\n    $fromChain: String\n    $toChain: String\n    $relayer: String\n    $version: String\n    $page: Int\n    $row: Int\n  ) {\n    queryLnBridgeRelayInfos(\n      fromChain: $fromChain\n      toChain: $toChain\n      relayer: $relayer\n      version: $version\n      page: $page\n      row: $row\n    ) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        bridge\n        relayer\n        sendToken\n        margin\n        baseFee\n        liquidityFeeRate\n        cost\n        profit\n        heartbeatTimestamp\n        messageChannel\n        lastTransferId\n        withdrawNonce\n        transferLimit\n        signers\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query QuerySortedRelayers(\n    $amount: String\n    $decimals: Int\n    $bridge: String\n    $token: String\n    $fromChain: String\n    $toChain: String\n  ) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      bridge: $bridge\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n",
): (typeof documents)["\n  query QuerySortedRelayers(\n    $amount: String\n    $decimals: Int\n    $bridge: String\n    $token: String\n    $fromChain: String\n    $toChain: String\n  ) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      bridge: $bridge\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryWithdrawableLiquidities(\n    $row: Int!\n    $page: Int!\n    $relayer: String = ""\n    $recvTokenAddress: String = ""\n    $fromChain: String = ""\n    $toChain: String = ""\n  ) {\n    historyRecords(\n      row: $row\n      page: $page\n      relayer: $relayer\n      recvTokenAddress: $recvTokenAddress\n      fromChains: [$fromChain]\n      toChains: [$toChain]\n      needWithdrawLiquidity: true\n    ) {\n      total\n      records {\n        id\n        sendAmount\n        lastRequestWithdraw\n      }\n    }\n  }\n',
): (typeof documents)['\n  query QueryWithdrawableLiquidities(\n    $row: Int!\n    $page: Int!\n    $relayer: String = ""\n    $recvTokenAddress: String = ""\n    $fromChain: String = ""\n    $toChain: String = ""\n  ) {\n    historyRecords(\n      row: $row\n      page: $page\n      relayer: $relayer\n      recvTokenAddress: $recvTokenAddress\n      fromChains: [$fromChain]\n      toChains: [$toChain]\n      needWithdrawLiquidity: true\n    ) {\n      total\n      records {\n        id\n        sendAmount\n        lastRequestWithdraw\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query checkLnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {\n    checkLnBridgeExist(\n      fromChainId: $fromChainId\n      toChainId: $toChainId\n      fromToken: $fromToken\n      toToken: $toToken\n      version: $version\n    )\n  }\n",
): (typeof documents)["\n  query checkLnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {\n    checkLnBridgeExist(\n      fromChainId: $fromChainId\n      toChainId: $toChainId\n      fromToken: $fromToken\n      toToken: $toToken\n      version: $version\n    )\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
