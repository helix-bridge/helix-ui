import { ChainConfig } from "@/types/chain";
import { baseGoerli } from "viem/chains";

export const baseGoerliChain: ChainConfig = {
  /**
   * Chain
   */
  ...baseGoerli,
  network: "base-goerli",
  name: "Base Goerli",

  /**
   * Custom
   */
  logo: "base.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x876A4f6eCF13EEb101F9E75FCeF58f19Ff383eEB",
      logo: "usdt.png",
      cross: [],
    },
  ],
  hidden: true,
};
