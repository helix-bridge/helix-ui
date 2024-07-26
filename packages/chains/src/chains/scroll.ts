import { scroll as scrollViem } from "viem/chains";
import { Chain } from "../types";

export const scroll: Chain = {
  ...scrollViem,
  network: "scroll",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/scroll.png",
};
