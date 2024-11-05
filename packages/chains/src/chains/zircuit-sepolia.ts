import { Chain } from "../types";

import { zircuitTestnet } from "viem/chains";

export const zircuitSepolia: Chain = {
  ...zircuitTestnet,
  network: "zircuit-sepolia",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/zircuit.png",
};
