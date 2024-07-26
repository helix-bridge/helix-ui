import { polygon as polygonViem } from "viem/chains";
import { Chain } from "../types";

export const polygon: Chain = {
  ...polygonViem,
  network: "polygon",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/polygon.png",
};
