import { ChainConfig, ChainID } from "@/types/chain";

export const baseChain: ChainConfig = {
  id: ChainID.BASE,
  network: "base",
  name: "Base",
  logo: "base.png",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
      webSocket: ["wss://base.publicnode.com"],
    },
    public: {
      http: ["https://mainnet.base.org"],
      webSocket: ["wss://base.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
    },
  },
  tokens: [],
};
