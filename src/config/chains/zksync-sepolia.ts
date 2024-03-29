import { ChainConfig } from "@/types/chain";
import { zkSyncSepoliaTestnet } from "viem/chains";

export const zksyncSepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...zkSyncSepoliaTestnet,
  network: "zksync-sepolia",
  name: "zkSync Sepolia Testnet",

  /**
   * Custom
   */
  logo: "zksync.png",
  tokens: [],
};
