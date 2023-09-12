import { arbitrumGoerliConfig, goerliConfig } from "@/config/chains";
import { ChainConfig } from "@/types";
import { Network } from "helix.js";

export function getChainConfig(network?: Network | null): ChainConfig | undefined {
  switch (network) {
    case "arbitrum-goerli":
      return arbitrumGoerliConfig;
    case "goerli":
      return goerliConfig;
    default:
      return;
  }
}
