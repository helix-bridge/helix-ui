import { ChainConfig } from "@/types";
import { arbitrumGoerli } from "wagmi/chains";

export const arbitrumGoerliConfig: ChainConfig = {
  logo: "arbitrum.png",
  ...arbitrumGoerli,
};
