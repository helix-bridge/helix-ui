import { baseSepolia as baseSepoliaViem } from "viem/chains";
import { Chain } from "../types";

export const baseSepolia: Chain = {
  ...baseSepoliaViem,
  network: "base-sepolia",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/base.png",
};
