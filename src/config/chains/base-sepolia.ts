import { ChainConfig } from "../../types/chain";
import { baseSepolia } from "viem/chains";

export const baseSepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...baseSepolia,
  network: "base-sepolia",
  name: "Base Sepolia",

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
      logo: "eth.png",
      cross: [
        {
          target: { network: "sepolia", symbol: "ETH" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "eth",
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x61B6B8c7C00aA7F060a2BEDeE6b11927CC9c3eF1",
      logo: "usdt.png",
      cross: [
        {
          target: { network: "sepolia", symbol: "USDT" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "usdt",
    },
  ],
};
