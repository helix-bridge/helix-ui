import { mainnet as mainnetViem } from "viem/chains";
import { Chain } from "../types";

export const mainnet: Chain = {
  ...mainnetViem,
  network: "ethereum",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/ethereum.png",
};
