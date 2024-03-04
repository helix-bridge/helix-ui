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
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
      logo: "ring.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      logo: "usdt.png",
      cross: [],
    },
  ],
};
