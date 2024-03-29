import { ChainConfig } from "@/types";
import { gnosis } from "viem/chains";

export const gnosisChain: ChainConfig = {
  /**
   * Chain
   */
  ...gnosis,
  network: "gnosis",
  name: "Gnosis Chain",

  /**
   * Custom
   */
  logo: "gnosis.png",
  tokens: [],
};
