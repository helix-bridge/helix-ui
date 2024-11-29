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
  "\n  query CurrentlyAvailableCrossChain($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n":
    types.CurrentlyAvailableCrossChainDocument,
  "\n  query HistoryTxByHash($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      id\n      fromChain\n      toChain\n      bridge\n      reason\n      nonce\n      requestTxHash\n      responseTxHash\n      sender\n      recipient\n      sendToken\n      recvToken\n      sendAmount\n      recvAmount\n      startTime\n      endTime\n      result\n      fee\n      feeToken\n      messageNonce\n      sendTokenAddress\n      recvTokenAddress\n      sendOuterTokenAddress\n      recvOuterTokenAddress\n      guardSignatures\n      relayer\n      endTxHash\n      confirmedBlocks\n      needWithdrawLiquidity\n      lastRequestWithdraw\n      extData\n    }\n  }\n":
    types.HistoryTxByHashDocument,
  "\n  query HistoryTxById($id: String) {\n    historyRecordById(id: $id) {\n      id\n      fromChain\n      toChain\n      bridge\n      reason\n      nonce\n      requestTxHash\n      responseTxHash\n      sender\n      recipient\n      sendToken\n      recvToken\n      sendAmount\n      recvAmount\n      startTime\n      endTime\n      result\n      fee\n      feeToken\n      messageNonce\n      sendTokenAddress\n      recvTokenAddress\n      sendOuterTokenAddress\n      recvOuterTokenAddress\n      guardSignatures\n      relayer\n      endTxHash\n      confirmedBlocks\n      needWithdrawLiquidity\n      lastRequestWithdraw\n      extData\n    }\n  }\n":
    types.HistoryTxByIdDocument,
  "\n  query MaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {\n    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)\n  }\n":
    types.MaxTransferDocument,
  "\n  query SortedRelayInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n":
    types.SortedRelayInfoDocument,
  '\n  query WithdrawableTXs(\n    $row: Int!\n    $page: Int!\n    $relayer: String = ""\n    $toToken: String = ""\n    $fromChain: String = ""\n    $toChain: String = ""\n  ) {\n    historyRecords(\n      row: $row\n      page: $page\n      relayer: $relayer\n      recvTokenAddress: $toToken\n      fromChains: [$fromChain]\n      toChains: [$toChain]\n      needWithdrawLiquidity: true\n    ) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        bridge\n        reason\n        nonce\n        requestTxHash\n        responseTxHash\n        sender\n        recipient\n        sendToken\n        recvToken\n        sendAmount\n        recvAmount\n        startTime\n        endTime\n        result\n        fee\n        feeToken\n        messageNonce\n        sendTokenAddress\n        recvTokenAddress\n        sendOuterTokenAddress\n        recvOuterTokenAddress\n        guardSignatures\n        relayer\n        endTxHash\n        confirmedBlocks\n        needWithdrawLiquidity\n        lastRequestWithdraw\n        extData\n      }\n    }\n  }\n':
    types.WithdrawableTXsDocument,
  "\n  query LnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {\n    checkLnBridgeExist(\n      fromChainId: $fromChainId\n      toChainId: $toChainId\n      fromToken: $fromToken\n      toToken: $toToken\n      version: $version\n    )\n  }\n":
    types.LnBridgeExistDocument,
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
  source: "\n  query CurrentlyAvailableCrossChain($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n",
): (typeof documents)["\n  query CurrentlyAvailableCrossChain($tokenKey: String!) {\n    queryLnBridgeSupportedChains(tokenKey: $tokenKey) {\n      tokenKey\n      chains {\n        fromChain\n        toChains\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query HistoryTxByHash($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      id\n      fromChain\n      toChain\n      bridge\n      reason\n      nonce\n      requestTxHash\n      responseTxHash\n      sender\n      recipient\n      sendToken\n      recvToken\n      sendAmount\n      recvAmount\n      startTime\n      endTime\n      result\n      fee\n      feeToken\n      messageNonce\n      sendTokenAddress\n      recvTokenAddress\n      sendOuterTokenAddress\n      recvOuterTokenAddress\n      guardSignatures\n      relayer\n      endTxHash\n      confirmedBlocks\n      needWithdrawLiquidity\n      lastRequestWithdraw\n      extData\n    }\n  }\n",
): (typeof documents)["\n  query HistoryTxByHash($txHash: String) {\n    historyRecordByTxHash(txHash: $txHash) {\n      id\n      fromChain\n      toChain\n      bridge\n      reason\n      nonce\n      requestTxHash\n      responseTxHash\n      sender\n      recipient\n      sendToken\n      recvToken\n      sendAmount\n      recvAmount\n      startTime\n      endTime\n      result\n      fee\n      feeToken\n      messageNonce\n      sendTokenAddress\n      recvTokenAddress\n      sendOuterTokenAddress\n      recvOuterTokenAddress\n      guardSignatures\n      relayer\n      endTxHash\n      confirmedBlocks\n      needWithdrawLiquidity\n      lastRequestWithdraw\n      extData\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query HistoryTxById($id: String) {\n    historyRecordById(id: $id) {\n      id\n      fromChain\n      toChain\n      bridge\n      reason\n      nonce\n      requestTxHash\n      responseTxHash\n      sender\n      recipient\n      sendToken\n      recvToken\n      sendAmount\n      recvAmount\n      startTime\n      endTime\n      result\n      fee\n      feeToken\n      messageNonce\n      sendTokenAddress\n      recvTokenAddress\n      sendOuterTokenAddress\n      recvOuterTokenAddress\n      guardSignatures\n      relayer\n      endTxHash\n      confirmedBlocks\n      needWithdrawLiquidity\n      lastRequestWithdraw\n      extData\n    }\n  }\n",
): (typeof documents)["\n  query HistoryTxById($id: String) {\n    historyRecordById(id: $id) {\n      id\n      fromChain\n      toChain\n      bridge\n      reason\n      nonce\n      requestTxHash\n      responseTxHash\n      sender\n      recipient\n      sendToken\n      recvToken\n      sendAmount\n      recvAmount\n      startTime\n      endTime\n      result\n      fee\n      feeToken\n      messageNonce\n      sendTokenAddress\n      recvTokenAddress\n      sendOuterTokenAddress\n      recvOuterTokenAddress\n      guardSignatures\n      relayer\n      endTxHash\n      confirmedBlocks\n      needWithdrawLiquidity\n      lastRequestWithdraw\n      extData\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query MaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {\n    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)\n  }\n",
): (typeof documents)["\n  query MaxTransfer($token: String, $balance: String, $fromChain: String, $toChain: String) {\n    queryMaxTransfer(token: $token, balance: $balance, fromChain: $fromChain, toChain: $toChain)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query SortedRelayInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n",
): (typeof documents)["\n  query SortedRelayInfo($amount: String, $decimals: Int, $token: String, $fromChain: String, $toChain: String) {\n    sortedLnBridgeRelayInfos(\n      amount: $amount\n      decimals: $decimals\n      token: $token\n      fromChain: $fromChain\n      toChain: $toChain\n    ) {\n      transferLimit\n      records {\n        sendToken\n        relayer\n        margin\n        baseFee\n        protocolFee\n        liquidityFeeRate\n        lastTransferId\n        withdrawNonce\n        bridge\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query WithdrawableTXs(\n    $row: Int!\n    $page: Int!\n    $relayer: String = ""\n    $toToken: String = ""\n    $fromChain: String = ""\n    $toChain: String = ""\n  ) {\n    historyRecords(\n      row: $row\n      page: $page\n      relayer: $relayer\n      recvTokenAddress: $toToken\n      fromChains: [$fromChain]\n      toChains: [$toChain]\n      needWithdrawLiquidity: true\n    ) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        bridge\n        reason\n        nonce\n        requestTxHash\n        responseTxHash\n        sender\n        recipient\n        sendToken\n        recvToken\n        sendAmount\n        recvAmount\n        startTime\n        endTime\n        result\n        fee\n        feeToken\n        messageNonce\n        sendTokenAddress\n        recvTokenAddress\n        sendOuterTokenAddress\n        recvOuterTokenAddress\n        guardSignatures\n        relayer\n        endTxHash\n        confirmedBlocks\n        needWithdrawLiquidity\n        lastRequestWithdraw\n        extData\n      }\n    }\n  }\n',
): (typeof documents)['\n  query WithdrawableTXs(\n    $row: Int!\n    $page: Int!\n    $relayer: String = ""\n    $toToken: String = ""\n    $fromChain: String = ""\n    $toChain: String = ""\n  ) {\n    historyRecords(\n      row: $row\n      page: $page\n      relayer: $relayer\n      recvTokenAddress: $toToken\n      fromChains: [$fromChain]\n      toChains: [$toChain]\n      needWithdrawLiquidity: true\n    ) {\n      total\n      records {\n        id\n        fromChain\n        toChain\n        bridge\n        reason\n        nonce\n        requestTxHash\n        responseTxHash\n        sender\n        recipient\n        sendToken\n        recvToken\n        sendAmount\n        recvAmount\n        startTime\n        endTime\n        result\n        fee\n        feeToken\n        messageNonce\n        sendTokenAddress\n        recvTokenAddress\n        sendOuterTokenAddress\n        recvOuterTokenAddress\n        guardSignatures\n        relayer\n        endTxHash\n        confirmedBlocks\n        needWithdrawLiquidity\n        lastRequestWithdraw\n        extData\n      }\n    }\n  }\n'];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query LnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {\n    checkLnBridgeExist(\n      fromChainId: $fromChainId\n      toChainId: $toChainId\n      fromToken: $fromToken\n      toToken: $toToken\n      version: $version\n    )\n  }\n",
): (typeof documents)["\n  query LnBridgeExist($fromChainId: Int, $toChainId: Int, $fromToken: String, $toToken: String, $version: String) {\n    checkLnBridgeExist(\n      fromChainId: $fromChainId\n      toChainId: $toChainId\n      fromToken: $fromToken\n      toToken: $toToken\n      version: $version\n    )\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
