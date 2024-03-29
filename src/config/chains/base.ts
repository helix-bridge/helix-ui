import { ChainConfig } from "@/types/chain";
import { base } from "viem/chains";

export const baseChain: ChainConfig = {
  /**
   * Chain
   */
  ...base,
  network: "base",
  name: "Base",

  /**
   * Custom
   */
  logo: "base.png",
  tokens: [],
};
