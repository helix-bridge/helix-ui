import { Chain } from "../types";

import { zircuit as zircuitViem } from "viem/chains";

export const zircuit: Chain = {
  ...zircuitViem,
  network: "zircuit",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/zircuit.png",
};
