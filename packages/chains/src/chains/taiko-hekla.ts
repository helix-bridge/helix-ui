import { taikoHekla as taikoHeklaViem } from "viem/chains";
import { Chain } from "../types";

export const taikoHekla: Chain = {
  ...taikoHeklaViem,
  network: "taiko-hekla",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/taiko.png",
};
