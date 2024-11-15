import { MAINNET_INDEXER_ENDPOINT } from "../config";
import { TESTNET_INDEXER_ENDPOINT } from "../config";

export function getEndpoint(isTestnet: boolean | undefined) {
  return isTestnet ? TESTNET_INDEXER_ENDPOINT : MAINNET_INDEXER_ENDPOINT;
}
