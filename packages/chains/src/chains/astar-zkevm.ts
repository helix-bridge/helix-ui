import { astarZkEVM as astarZkEVMViem } from "viem/chains";
import { Chain } from "../types";

export const astarZkEVM: Chain = {
  ...astarZkEVMViem,
  network: "astar-zkevm",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/astar.png",
};
