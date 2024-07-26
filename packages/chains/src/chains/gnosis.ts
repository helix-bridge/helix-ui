import { gnosis as gnosisViem } from "viem/chains";
import { Chain } from "../types";

export const gnosis: Chain = {
  ...gnosisViem,
  network: "gnosis",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/gnosis.png",
};
