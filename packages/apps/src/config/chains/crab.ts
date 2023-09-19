import { ChainConfig, ChainID } from "@/types/chain";

export const crabChain: ChainConfig = {
  id: ChainID.CRAB,
  network: "crab-dvm",
  name: "Crab",
  logo: "crab.svg",
  nativeCurrency: {
    name: "CRAB",
    symbol: "CRAB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://crab-rpc.darwinia.network"],
      webSocket: ["wss://crab-rpc.darwinia.network"],
    },
    public: {
      http: ["https://crab-rpc.darwinia.network"],
      webSocket: ["wss://crab-rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://crab.subscan.io/",
    },
  },
  tokens: [],
};
