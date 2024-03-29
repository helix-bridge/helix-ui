import { ChainConfig } from "@/types/chain";
import { polygon } from "viem/chains";

export const polygonChain: ChainConfig = {
  /**
   * Chain
   */
  ...polygon,
  network: "polygon",
  name: "Polygon PoS",

  /**
   * Custom
   */
  logo: "polygon.png",
  tokens: [],
};
