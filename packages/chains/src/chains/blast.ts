import { blast as blastViem } from "viem/chains";
import { Chain } from "../types";

export const blast: Chain = {
  ...blastViem,
  network: "blast",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/blast.png",
};
