import { avalanche as avalancheViem } from "viem/chains";
import { Chain } from "../types";

export const avalanche: Chain = {
  ...avalancheViem,
  network: "avalanche",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/avax.png",
};
