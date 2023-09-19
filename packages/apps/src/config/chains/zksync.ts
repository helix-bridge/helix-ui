import { ChainConfig, ChainID } from "@/types/chain";

export const zksyncChain: ChainConfig = {
  id: ChainID.ZKSYNC,
  network: "zksync",
  name: "Zksync",
  logo: "zksync.png",
  nativeCurrency: {
    name: "zkETH",
    symbol: "zkETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.era.zksync.io"],
      webSocket: ["wss://mainnet.era.zksync.io/ws"],
    },
    public: {
      http: ["https://mainnet.era.zksync.io"],
      webSocket: ["wss://mainnet.era.zksync.io/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Zksync",
      url: "https://explorer.zksync.io/",
    },
  },
  tokens: [],
};
