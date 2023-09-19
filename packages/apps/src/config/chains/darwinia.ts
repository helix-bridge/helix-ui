import { ChainConfig, ChainID } from "@/types/chain";

export const darwiniaChain: ChainConfig = {
  id: ChainID.DARWINIA,
  network: "darwinia-dvm",
  name: "Darwinia",
  logo: "darwinia.png",
  nativeCurrency: {
    name: "RING",
    symbol: "RING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.darwinia.network"],
      webSocket: ["wss://rpc.darwinia.network"],
    },
    public: {
      http: ["https://rpc.darwinia.network"],
      webSocket: ["wss://rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://darwinia.subscan.io/",
    },
  },
  tokens: [],
};
