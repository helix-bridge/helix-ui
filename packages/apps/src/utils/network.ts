import { arbitrumGoerliConfig, goerliConfig } from "@/config/networks";
import { NetworkConfig } from "@/types";
import { Network } from "helix.js";

export function getNetworkConfig(network: Network): NetworkConfig | undefined {
  switch (network) {
    case "arbitrum-goerli":
      return arbitrumGoerliConfig;
    case "goerli":
      return goerliConfig;
    default:
      return;
  }
}
