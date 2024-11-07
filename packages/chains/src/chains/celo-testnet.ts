import { Chain } from "../types";
import { celoAlfajores } from "viem/chains";

export const celoTestnet: Chain = {
  ...celoAlfajores,
  network: "celo-testnet",
  name: "Celo Alfajores",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/celo.png",
};
