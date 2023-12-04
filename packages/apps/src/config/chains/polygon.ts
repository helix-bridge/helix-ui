import { ChainConfig, ChainID } from "@/types/chain";

export const polygonChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.POLYGON,
  network: "polygon",
  name: "Polygon PoS",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://polygon-rpc.com/"],
      webSocket: ["wss://polygon-bor.publicnode.com"],
    },
    public: {
      http: ["https://polygon-rpc.com/"],
      webSocket: ["wss://polygon-bor.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Polygonscan",
      url: "https://polygonscan.com/",
    },
  },

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
      cross: [{ target: { network: "arbitrum", symbol: "RING" }, bridge: { category: "lnbridgev20-default" } }],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      logo: "usdt.png",
      cross: [{ target: { network: "polygon-zkEvm", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
