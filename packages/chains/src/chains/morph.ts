import { Chain } from "../types";
import { morph as morphViem } from "viem/chains";

export const morph: Chain = {
  ...morphViem,
  network: "morph",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/morph.png",
};
