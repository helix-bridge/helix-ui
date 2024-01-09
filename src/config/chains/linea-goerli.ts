import { ChainConfig } from "@/types/chain";
import { lineaTestnet } from "viem/chains";

export const lineaGoerliChain: ChainConfig = {
  /**
   * Chain
   */
  ...lineaTestnet,
  network: "linea-goerli",
  name: "Linea Goerli",

  /**
   * Custom
   */
  logo: "linea.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [
        { target: { network: "goerli", symbol: "ETH" }, bridge: { category: "lnbridge" } },
        { target: { network: "arbitrum-goerli", symbol: "ETH" }, bridge: { category: "lnbridge" } },
        { target: { network: "zksync-goerli", symbol: "ETH" }, bridge: { category: "lnbridge" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xeC89AF5FF618bbF667755BE9d63C69F21F1c00C8",
      logo: "usdc.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
        { target: { network: "zksync-goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x8f3663930211f3DE17619FEB2eeB44c9c3F44a06",
      logo: "usdt.png",
      cross: [
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
        { target: { network: "zksync-goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
      ],
    },
  ],
};
