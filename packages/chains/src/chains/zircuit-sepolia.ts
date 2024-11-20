import { Chain } from "../types";
import { zircuitTestnet as zircuitTestnetViem } from "viem/chains";

export const zircuitTestnet: Chain = {
  ...zircuitTestnetViem,
  network: "zircuit-sepolia",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/zircuit.png",
};
