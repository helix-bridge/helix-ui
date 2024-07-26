import { berachainTestnet as berachainTestnetViem } from "viem/chains";
import { Chain } from "../types";

export const berachainTestnet: Chain = {
  ...berachainTestnetViem,
  network: "bera",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/bera.png",
};
