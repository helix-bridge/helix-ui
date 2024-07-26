import { crab as crabViem } from "viem/chains";
import { Chain } from "../types";

export const crab: Chain = {
  ...crabViem,
  network: "crab-dvm",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/crab.png",
};
