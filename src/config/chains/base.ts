import { ChainConfig } from "@/types/chain";
import { base } from "viem/chains";

export const baseChain: ChainConfig = {
  /**
   * Chain
   */
  ...base,
  network: "base",
  name: "Base",

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
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      logo: "usdc.svg",
      cross: [],
    },
  ],
};
