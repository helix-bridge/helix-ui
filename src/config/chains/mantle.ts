import { ChainConfig } from "@/types/chain";
import { mantle } from "viem/chains";

export const mantleChain: ChainConfig = {
  /**
   * Chain
   */
  ...mantle,
  network: "mantle",
  name: "Mantle",

  /**
   * Custom
   */
  logo: "mantle.png",
  tokens: [],
};
