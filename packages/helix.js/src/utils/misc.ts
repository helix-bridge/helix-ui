import { arbitrumGoerliChain, goerliChain } from "@/config";
import { ChainConfig, Network } from "@/types";

export function getChainsConfig() {
  return [goerliChain, arbitrumGoerliChain];
}

export function getChainConfig(network: Network) {
  const mapping: Record<Network, ChainConfig> = {
    "arbitrum-goerli": arbitrumGoerliChain,
    goerli: goerliChain,
  };

  return mapping[network];
}
