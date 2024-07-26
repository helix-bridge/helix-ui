import { arbitrum as arbitrumViem } from "viem/chains";
import { Chain } from "../types";

export const arbitrum: Chain = {
  ...arbitrumViem,
  network: "arbitrum",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/arbitrum.png",
};
