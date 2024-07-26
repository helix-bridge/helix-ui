import { zkSyncSepoliaTestnet } from "viem/chains";
import { Chain } from "../types";

export const zksyncSepolia: Chain = {
  ...zkSyncSepoliaTestnet,
  network: "zksync-sepolia",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/zksync.png",
};
