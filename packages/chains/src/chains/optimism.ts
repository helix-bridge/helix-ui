import { optimism as optimismViem } from "viem/chains";
import { Chain } from "../types";

export const optimism: Chain = {
  ...optimismViem,
  network: "op",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/optimism.png",
};
