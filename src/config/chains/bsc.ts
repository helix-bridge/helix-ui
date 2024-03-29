import { ChainConfig } from "@/types/chain";
import { bsc } from "viem/chains";

export const bscChain: ChainConfig = {
  /**
   * Chain
   */
  ...bsc,
  network: "bsc",
  name: "BSC",

  /**
   * Custom
   */
  logo: "bsc.png",
  tokens: [],
};
