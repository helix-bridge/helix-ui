import type { Network } from "helix.js";
import type { Chain } from "wagmi";

export interface NetworkConfig extends Chain {
  network: Network;
  logoSrc: string;
}
