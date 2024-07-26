import { mantle as mantleViem } from "viem/chains";
import { Chain } from "../types";

export const mantle: Chain = {
  ...mantleViem,
  network: "mantle",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/mantle.png",
};
