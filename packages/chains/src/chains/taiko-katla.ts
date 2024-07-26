import { taikoKatla as taikoKatlaViem } from "viem/chains";
import { Chain } from "../types";

export const taikoKatla: Chain = {
  ...taikoKatlaViem,
  network: "taiko",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/taiko.png",
};
