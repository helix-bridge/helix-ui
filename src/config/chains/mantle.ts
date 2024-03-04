import { ChainConfig } from "@/types/chain";
import { mantle } from "viem/chains";

export const mantleChain: ChainConfig = {
  /**
   * Chain
   */
  ...mantle,
  network: "mantle",
  name: "Mantle",

  /**
   * Custom
   */
  logo: "mantle.svg",
  tokens: [
    {
      decimals: 18,
      symbol: "MNT",
      name: "MNT",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "mnt.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
      logo: "usdt.png",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
      logo: "usdc.svg",
      cross: [],
    },
  ],
};
