import { ChainConfig } from "@/types";
import { goerli } from "wagmi/chains";

export const goerliConfig: ChainConfig = {
  logo: "ethereum.png",
  ...goerli,
};
