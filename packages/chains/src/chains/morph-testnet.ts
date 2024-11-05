import { morphHolesky } from "viem/chains";
import { Chain } from "../types";

export const morphTestnet: Chain = {
  ...morphHolesky,
  network: "morph-testnet",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/morph.png",
};
