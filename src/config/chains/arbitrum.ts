import { ChainConfig } from "@/types/chain";
import { arbitrum } from "viem/chains";

export const arbitrumChain: ChainConfig = {
  /**
   * Chain
   */
  ...arbitrum,
  network: "arbitrum",
  name: "Arbitrum One",

  /**
   * Custom
   */
  logo: "arbitrum.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.png",
      cross: [
        {
          target: { network: "blast", symbol: "ETH" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
        { target: { network: "linea", symbol: "ETH" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        {
          target: { network: "astar-zkevm", symbol: "ETH" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "eth",
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9e523234D36973f9e38642886197D023C88e307e",
      logo: "ring.png",
      cross: [
        { target: { network: "ethereum", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "opposite" } },
        { target: { network: "darwinia-dvm", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "polygon", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "ring",
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      logo: "usdt.png",
      cross: [
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "zksync", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "linea", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "polygon", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "op", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "gnosis", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "scroll", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "usdt",
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      logo: "usdc.png",
      cross: [
        { target: { network: "mantle", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "scroll", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "usdc",
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
