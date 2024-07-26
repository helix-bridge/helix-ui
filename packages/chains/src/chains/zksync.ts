import { zkSync as zkSyncViem } from "viem/chains";
import { Chain } from "../types";

export const zkSync: Chain = {
  ...zkSyncViem,
  network: "zksync",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/zksync.png",
};
