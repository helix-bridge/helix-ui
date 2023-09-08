import { arbitrumGoerliChain, goerliChain } from "../config";
import { Network } from "../types";

export function getChainsConfig() {
  return [goerliChain, arbitrumGoerliChain];
}

export function getChainConfig(network: Network) {
  switch (network) {
    case "arbitrum-goerli":
      return arbitrumGoerliChain;
    case "goerli":
      return goerliChain;
    default:
      return undefined;
  }
}
