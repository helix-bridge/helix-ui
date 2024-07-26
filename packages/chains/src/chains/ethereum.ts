import { mainnet } from "viem/chains";
import { Chain } from "../types";

export const ethereum: Chain = {
  ...mainnet,
  network: "ethereum",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/ethereum.png",
};
