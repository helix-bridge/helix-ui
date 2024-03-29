import { ChainConfig } from "@/types/chain";
import { linea } from "viem/chains";

export const lineaChain: ChainConfig = {
  /**
   * Chain
   */
  ...linea,
  network: "linea",
  name: "Linea",

  /**
   * Custom
   */
  logo: "linea.png",
  tokens: [],
};
