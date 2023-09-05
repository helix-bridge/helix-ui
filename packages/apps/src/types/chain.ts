import type { Network } from "helix.js";
import type { Chain } from "wagmi";

export interface ChainConfig extends Chain {
  network: Network;
  logo: string; // file name
}
