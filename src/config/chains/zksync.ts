import { ChainConfig } from "../../types/chain";
import { zkSync } from "viem/chains";

export const zksyncChain: ChainConfig = {
  /**
   * Chain
   */
  ...zkSync,
  network: "zksync",
  name: "zkSync era",

  /**
   * Custom
   */
  logo: "zksync.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.png",
      cross: [],
      category: "eth",
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C",
      logo: "usdt.png",
      cross: [
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "scroll", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "usdt",
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
      logo: "usdc.png",
      cross: [],
      category: "usdc",
    },
  ],
};
