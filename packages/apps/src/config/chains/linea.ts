import { ChainConfig, ChainID } from "@/types/chain";

export const lineaChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.LINEA,
  network: "linea",
  name: "Linea",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.linea.build"],
      webSocket: ["wss://rpc.linea.build"],
    },
    public: {
      http: ["https://rpc.linea.build"],
      webSocket: ["wss://rpc.linea.build"],
    },
  },
  blockExplorers: {
    default: {
      name: "BlockScout",
      url: "https://explorer.linea.build/",
    },
  },

  /**
   * Custom
   */
  logo: "linea.png",
  tokens: [],
};
