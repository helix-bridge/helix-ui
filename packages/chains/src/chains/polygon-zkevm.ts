import { polygonZkEvm as polygonZkEvmViem } from "viem/chains";
import { Chain } from "../types";

export const polygonZkEvm: Chain = {
  ...polygonZkEvmViem,
  network: "polygon-zkEvm",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/polygon.png",
};
