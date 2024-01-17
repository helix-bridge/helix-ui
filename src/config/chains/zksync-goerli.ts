import { ChainConfig } from "@/types/chain";
import { zkSyncTestnet } from "viem/chains";

export const zksyncGoerliChain: ChainConfig = {
  /**
   * Chain
   */
  ...zkSyncTestnet,
  network: "zksync-goerli",
  name: "Zksync Era Testnet",

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
      logo: "eth.svg",
      cross: [
        { target: { network: "goerli", symbol: "ETH" }, bridge: { category: "lnbridge" } },
        { target: { network: "arbitrum-goerli", symbol: "ETH" }, bridge: { category: "lnbridge" } },
        { target: { network: "linea-goerli", symbol: "ETH" }, bridge: { category: "lnbridge" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xAe60e005C560E869a2bad271e38e3C9D78381aFF",
      logo: "usdc.svg",
      cross: [
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridge" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xb5372ed3bb2CbA63e7908066ac10ee94d30eA839",
      logo: "usdt.png",
      cross: [
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridge" } },
      ],
    },
  ],
  hidden: true,
};
