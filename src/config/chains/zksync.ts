import { ChainConfig } from "@/types/chain";
import { zkSync } from "viem/chains";

export const zksyncChain: ChainConfig = {
  /**
   * Chain
   */
  ...zkSync,
  network: "zksync",
  name: "zkSync era",

  /**
   * Custom
   */
  logo: "zksync.png",
  tokens: [],
};
