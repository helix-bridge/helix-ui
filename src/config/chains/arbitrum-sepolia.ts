import { ChainConfig } from "@/types/chain";
import { arbitrumSepolia } from "viem/chains";

export const arbitrumSepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...arbitrumSepolia,
  network: "arbitrum-sepolia",
  name: "Arbitrum Sepolia",

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
      logo: "eth.svg",
      cross: [
        { target: { network: "sepolia", symbol: "ETH" }, bridge: { category: "lnbridge" } },
        { target: { network: "zksync-sepolia", symbol: "ETH" }, bridge: { category: "lnbridge" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x8A87497488073307E1a17e8A12475a94Afcb413f",
      logo: "usdc.svg",
      cross: [
        { target: { network: "zksync-sepolia", symbol: "USDC" }, bridge: { category: "lnbridge" } },
        { target: { network: "sepolia", symbol: "USDC" }, bridge: { category: "lnbridge" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x3b8Bb7348D4F581e67E2498574F73e4B9Fc51855",
      logo: "usdt.png",
      cross: [
        { target: { network: "zksync-sepolia", symbol: "USDT" }, bridge: { category: "lnbridge" } },
        { target: { network: "sepolia", symbol: "USDT" }, bridge: { category: "lnbridge" } },
      ],
    },
  ],
};
