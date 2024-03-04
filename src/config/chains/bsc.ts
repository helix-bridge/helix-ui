import { ChainConfig } from "@/types/chain";
import { bsc } from "viem/chains";

export const bscChain: ChainConfig = {
  /**
   * Chain
   */
  ...bsc,
  network: "bsc",
  name: "BSC",

  /**
   * Custom
   */
  logo: "bsc.svg",
  tokens: [
    {
      decimals: 18,
      symbol: "BNB",
      name: "BNB",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "bnb.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x55d398326f99059fF775485246999027B3197955",
      logo: "usdt.png",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      logo: "usdc.svg",
      cross: [],
    },
  ],
};
