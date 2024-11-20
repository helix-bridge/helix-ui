import { Address, Hash } from "viem";
import { getCurrentlyAvailableCrossChain, type CurrentlyAvailableCrossChain } from "./getCurrentlyAvailableCrossChain";
import { getHistoryTxByHash, type HistoryTxByHash } from "./getHistoryTxByHash";
import { getHistoryTxById, type HistoryTxById } from "./getHistoryTxById";
import { getSortedRelayInfo, type SortedRelayInfo } from "./getSortedRelayInfo";
import { isCrossChainSupportedByLnBridge, type LnBridgeExist } from "./isCrossChainSupportedByLnBridge";
import { getMaxTransfer, type MaxTransfer } from "./getMaxTransfer";
import { getWithdrawableTXs, type WithdrawableTXs } from "./getWithdrawableTXs";
import { Chain } from "@helixbridge/chains";

class IndexerClient {
  private readonly endpoint: string;
  constructor(readonly testnet: boolean) {
    this.endpoint = testnet ? "https://apollo-test.helix.box/graphql" : "https://apollo.helix.box/graphql";
  }

  getCurrentlyAvailableCrossChain(tokenKey = ""): Promise<CurrentlyAvailableCrossChain> {
    return getCurrentlyAvailableCrossChain(this.endpoint, tokenKey);
  }

  getHistoryTxByHash(txHash: Hash): Promise<HistoryTxByHash> {
    return getHistoryTxByHash(this.endpoint, txHash);
  }

  getHistoryTxById(id: string): Promise<HistoryTxById> {
    return getHistoryTxById(this.endpoint, id);
  }

  getSortedRelayInfo(
    fromChain: Chain,
    toChain: Chain,
    transferToken: Address,
    transferAmount: bigint,
  ): Promise<SortedRelayInfo> {
    return getSortedRelayInfo(this.endpoint, fromChain, toChain, transferToken, transferAmount);
  }

  isCrossChainSupportedByLnBridge(
    fromChain: Chain,
    toChain: Chain,
    fromToken: Address,
    toToken: Address,
    version: "lnv3" | "lnv2",
  ): Promise<LnBridgeExist> {
    return isCrossChainSupportedByLnBridge(this.endpoint, fromChain.id, toChain.id, fromToken, toToken, version);
  }

  getMaxTransfer(token: Address, balance: bigint, fromChain: Chain, toChain: Chain): Promise<MaxTransfer> {
    return getMaxTransfer(this.endpoint, token, balance, fromChain, toChain);
  }

  getWithdrawableTXs(
    row: number,
    page: number,
    relayer: Address,
    toToken: Address,
    fromChain: Chain,
    toChain: Chain,
  ): Promise<WithdrawableTXs> {
    return getWithdrawableTXs(this.endpoint, row, page, relayer, toToken, fromChain, toChain);
  }
}

export default IndexerClient;
export type {
  CurrentlyAvailableCrossChain,
  HistoryTxByHash,
  HistoryTxById,
  SortedRelayInfo,
  LnBridgeExist,
  MaxTransfer,
  WithdrawableTXs,
};
