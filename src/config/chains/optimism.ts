import { ChainConfig } from "@/types/chain";
import { optimism } from "viem/chains";

export const optimismChain: ChainConfig = {
  /**
   * Chain
   */
  ...optimism,
  network: "op",
  name: "OP Mainnet",

  /**
   * Custom
   */
  logo: "optimism.png",
  tokens: [],
};
