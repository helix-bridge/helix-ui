import { ChainConfig, ChainID } from "@/types/chain";

export const mumbaiChain: ChainConfig = {
  id: ChainID.MUMBAI,
  network: "mumbai",
  name: "Mumbai",
  logo: "polygon.png",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.ankr.com/polygon_mumbai"],
      webSocket: [],
    },
    public: {
      http: ["https://rpc.ankr.com/polygon_mumbai"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Polygonscan",
      url: "https://mumbai.polygonscan.com/",
    },
  },
  testnet: true,
  tokens: [],
};
