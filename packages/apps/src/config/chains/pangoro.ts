import { ChainConfig, ChainID } from "@/types/chain";

export const pangoroChain: ChainConfig = {
  id: ChainID.PANGORO,
  network: "pangoro-dvm",
  name: "Pangoro",
  logo: "pangoro.png",
  nativeCurrency: {
    name: "ORING",
    symbol: "ORING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://pangoro-rpc.darwinia.network"],
      webSocket: ["wss://pangoro-rpc.darwinia.network"],
    },
    public: {
      http: ["https://pangoro-rpc.darwinia.network"],
      webSocket: ["wss://pangoro-rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://pangoro.subscan.io/",
    },
  },
  tokens: [],
};
