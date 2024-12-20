import { morphHolesky as morphHoleskyViem } from "viem/chains";
import { Chain } from "../types";

export const morphHolesky: Chain = {
  ...morphHoleskyViem,
  network: "morph-testnet",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/morph.png",
};
