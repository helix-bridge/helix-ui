import { arbitrumSepolia as arbitrumSepoliaViem } from "viem/chains";
import { Chain } from "../types";

export const arbitrumSepolia: Chain = {
  ...arbitrumSepoliaViem,
  network: "arbitrum-sepolia",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/arbitrum.png",
};
