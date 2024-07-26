import { base as baseViem } from "viem/chains";
import { Chain } from "../types";

export const base: Chain = {
  ...baseViem,
  network: "base",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/base.png",
};
