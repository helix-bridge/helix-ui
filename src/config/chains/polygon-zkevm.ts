import { ChainConfig } from "@/types";
import { polygonZkEvm } from "viem/chains";

export const polygonZkEvmChain: ChainConfig = {
  /**
   * Chain
   */
  ...polygonZkEvm,
  network: "polygon-zkEvm",
  name: "Polygon zkEVM",

  /**
   * Custom
   */
  logo: "polygon.png",
  tokens: [],
};
