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
      logo: "eth.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9e523234D36973f9e38642886197D023C88e307e",
      logo: "ring.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      logo: "usdt.png",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
      logo: "usdc.svg",
      cross: [],
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
