import { ChainConfig } from "@/types/chain";
import { polygon } from "viem/chains";

export const polygonChain: ChainConfig = {
  /**
   * Chain
   */
  ...polygon,
  network: "polygon",
  name: "Polygon PoS",

  /**
   * Custom
   */
  logo: "polygon.png",
  tokens: [
    {
      decimals: 18,
      symbol: "MATIC",
      name: "MATIC",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "matic.svg",
      cross: [],
      category: "others",
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
      logo: "ring.svg",
      cross: [
        { target: { network: "arbitrum", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "ring",
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      logo: "usdt.png",
      cross: [
        { target: { network: "polygon-zkEvm", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "arbitrum", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "linea", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "op", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "scroll", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "gnosis", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
      category: "usdt",
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
