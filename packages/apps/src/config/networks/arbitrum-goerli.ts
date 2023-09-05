import { NetworkConfig } from "@/types";
import { arbitrumGoerli } from "wagmi/chains";

export const arbitrumGoerliConfig: NetworkConfig = {
  logoSrc: "arbitrum.png",
  ...arbitrumGoerli,
};
