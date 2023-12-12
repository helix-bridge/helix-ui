import { ChainConfig } from "@/types/chain";
import { polygonMumbai } from "viem/chains";

export const mumbaiChain: ChainConfig = {
  /**
   * Chain
   */
  ...polygonMumbai,
  network: "mumbai",
  name: "Mumbai",

  /**
   * Custom
   */
  logo: "polygon.png",
  tokens: [],
};
