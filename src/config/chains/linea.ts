import { ChainConfig } from "@/types/chain";
import { linea } from "viem/chains";

export const lineaChain: ChainConfig = {
  /**
   * Chain
   */
  ...linea,
  network: "linea",
  name: "Linea",

  /**
   * Custom
   */
  logo: "linea.png",
  tokens: [
    {
      decimals: 18,
      symbol: "BNB",
      name: "BNB",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "bnb.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
      logo: "usdt.png",
      cross: [
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
