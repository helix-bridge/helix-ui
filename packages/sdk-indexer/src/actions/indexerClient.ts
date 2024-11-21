import { Address, Hash } from "viem";
import { getCurrentlyAvailableCrossChain, type CurrentlyAvailableCrossChain } from "./getCurrentlyAvailableCrossChain";
import { getHistoryTxByHash, type HistoryTxByHash } from "./getHistoryTxByHash";
import { getHistoryTxById, type HistoryTxById } from "./getHistoryTxById";
import { getSortedRelayInfo, type SortedRelayInfo } from "./getSortedRelayInfo";
import { isCrossChainSupportedByLnBridge, type LnBridgeExist } from "./isCrossChainSupportedByLnBridge";
import { getMaxTransfer, type MaxTransfer } from "./getMaxTransfer";
import { getWithdrawableTXs, type WithdrawableTXs } from "./getWithdrawableTXs";
import { Chain } from "@helixbridge/chains";
import { MAINNET_ENDPOINT, TESTNET_ENDPOINT } from "../config";

export type {
  CurrentlyAvailableCrossChain,
  HistoryTxByHash,
  HistoryTxById,
  SortedRelayInfo,
  LnBridgeExist,
  MaxTransfer,
  WithdrawableTXs,
};

export class IndexerClient {
  private readonly endpoint: string;
  constructor({ testnet }: { testnet: boolean }) {
    this.endpoint = testnet ? TESTNET_ENDPOINT : MAINNET_ENDPOINT;
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
    fromToken: Address,
    transferAmount: bigint,
  ): Promise<SortedRelayInfo> {
    return getSortedRelayInfo(this.endpoint, fromChain, toChain, fromToken, transferAmount);
  }

  isCrossChainSupportedByLnBridge(
    fromChain: Chain,
    toChain: Chain,
    fromToken: Address,
    toToken: Address,
    version: "lnv3" | "lnv2",
  ): Promise<LnBridgeExist> {
    return isCrossChainSupportedByLnBridge(this.endpoint, fromChain, toChain, fromToken, toToken, version);
  }

  getMaxTransfer(fromChain: Chain, toChain: Chain, fromToken: Address, senderBalance: bigint): Promise<MaxTransfer> {
    return getMaxTransfer(this.endpoint, fromChain, toChain, fromToken, senderBalance);
  }

  getWithdrawableTXs(
    row: number,
    page: number,
    relayer: Address,
    fromChain: Chain,
    toChain: Chain,
    toToken: Address,
  ): Promise<WithdrawableTXs> {
    return getWithdrawableTXs(this.endpoint, row, page, relayer, fromChain, toChain, toToken);
  }
}
