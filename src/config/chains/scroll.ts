import { ChainConfig } from "@/types/chain";
import { scroll } from "viem/chains";

export const scrollChain: ChainConfig = {
  /**
   * Chain
   */
  ...scroll,
  network: "scroll",
  name: "Scroll",

  /**
   * Custom
   */
  logo: "scroll.png",
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
      address: "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
      logo: "usdt.png",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
      logo: "usdc.svg",
      cross: [],
    },
  ],
};
