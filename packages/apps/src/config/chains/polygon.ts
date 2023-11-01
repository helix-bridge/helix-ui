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
  tokens: [],
};
