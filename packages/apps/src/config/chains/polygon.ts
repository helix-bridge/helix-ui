import { ChainConfig, ChainID } from "@/types/chain";

export const polygonChain: ChainConfig = {
  id: ChainID.POLYGON,
  network: "polygon",
  name: "Polygon PoS",
  logo: "polygon.png",
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
  tokens: [
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f",
      logo: "ring.svg",
      cross: [{ target: { network: "arbitrum", symbol: "RING" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
