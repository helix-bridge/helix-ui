import { NetworkConfig } from "@/types";
import { goerli } from "wagmi/chains";

export const goerliConfig: NetworkConfig = {
  logoSrc: "ethereum.png",
  ...goerli,
};
