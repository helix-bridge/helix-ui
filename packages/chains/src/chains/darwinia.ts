import { Chain, ChainID } from "../types";
import { darwinia as darwiniaViem } from "viem/chains";

export const darwinia: Chain = {
  ...darwiniaViem,
  id: ChainID.DARWINIA,
  network: "darwinia-dvm",
  logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/chains/darwinia.png",
};
