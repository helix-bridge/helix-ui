import { morphSepolia as morphSepoliaViem } from "viem/chains";
import { Chain } from "../types";

export const morphSepolia: Chain = {
  ...morphSepoliaViem,
  network: "morph",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/morph.png",
};
