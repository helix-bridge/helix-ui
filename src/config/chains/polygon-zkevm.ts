import { ChainConfig } from "../../types";
import { polygonZkEvm } from "viem/chains";

export const polygonZkEvmChain: ChainConfig = {
  /**
   * Chain
   */
  ...polygonZkEvm,
  network: "polygon-zkEvm",
  name: "Polygon zkEVM",

  /**
   * Custom
   */
  logo: "polygon.png",
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
      address: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d",
      logo: "usdt.png",
      cross: [
        { target: { network: "polygon", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "usdt",
    },
  ],
};
