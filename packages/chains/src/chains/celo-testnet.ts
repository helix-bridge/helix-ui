import { Chain } from "../types";
import { celoAlfajores as celoAlfajoresViem } from "viem/chains";

export const celoAlfajores: Chain = {
  ...celoAlfajoresViem,
  network: "celo-testnet",
  name: "Celo Alfajores",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/celo.png",
};
