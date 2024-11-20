import { Chain } from "../types";
import { berachainTestnetbArtio as beraViem } from "viem/chains";

export const berachainTestnetbArtio: Chain = {
  ...beraViem,
  network: "bera",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/bera.png",
};
