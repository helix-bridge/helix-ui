import { ChainConfig } from "@/types/chain";
import { optimism } from "viem/chains";

export const optimismChain: ChainConfig = {
  /**
   * Chain
   */
  ...optimism,
  network: "op",
  name: "OP Mainnet",

  /**
   * Custom
   */
  logo: "optimism.png",
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
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      logo: "usdt.png",
      cross: [],
    },
  ],
};
