import { moonbeam as moonbeamViem } from "viem/chains";
import { Chain } from "../types";

export const moonbeam: Chain = {
  ...moonbeamViem,
  network: "moonbeam",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/moonbeam.png",
};
