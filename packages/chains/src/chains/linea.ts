import { linea as lineaViem } from "viem/chains";
import { Chain } from "../types";

export const linea: Chain = {
  ...lineaViem,
  network: "linea",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/linea.png",
};
