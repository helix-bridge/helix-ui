import { ChainConfig } from "@/types/chain";
import { scroll } from "viem/chains";

export const scrollChain: ChainConfig = {
  /**
   * Chain
   */
  ...scroll,
  network: "scroll",
  name: "Scroll",

  /**
   * Custom
   */
  logo: "scroll.png",
  tokens: [],
};
