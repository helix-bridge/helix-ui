import { sepolia as sepoliaViem } from "viem/chains";
import { Chain } from "../types";

export const sepolia: Chain = {
  ...sepoliaViem,
  network: "sepolia",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/sepolia.png",
};
