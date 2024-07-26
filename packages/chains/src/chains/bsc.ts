import { bsc as bscViem } from "viem/chains";
import { Chain } from "../types";

export const bsc: Chain = {
  ...bscViem,
  network: "bsc",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/bsc.png",
};
