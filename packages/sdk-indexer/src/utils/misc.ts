import { Chain } from "viem";
import { MAINNET_INDEXER_ENDPOINT } from "../config";
import { TESTNET_INDEXER_ENDPOINT } from "../config";

export function getIndexerUrl(chain: Chain) {
  return chain.testnet ? TESTNET_INDEXER_ENDPOINT : MAINNET_INDEXER_ENDPOINT;
}
