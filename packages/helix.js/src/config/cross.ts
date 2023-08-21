import { ChainID, CrossConfig } from "@/types";

export const crossConfig: CrossConfig[] = [
  {
    fromChain: ChainID.ETHEREUM,
    toChain: ChainID.ARBITRUM,
    fromToken: "RING",
    toToken: "RING",
  },
];
