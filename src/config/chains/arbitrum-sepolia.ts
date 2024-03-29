import { ChainConfig } from "@/types/chain";
import { arbitrumSepolia } from "viem/chains";

export const arbitrumSepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...arbitrumSepolia,
  network: "arbitrum-sepolia",
  name: "Arbitrum Sepolia",

  /**
   * Custom
   */
  logo: "arbitrum.png",
  tokens: [],
};
