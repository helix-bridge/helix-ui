import { ChainConfig, ChainID } from "@/types/chain";

export const pangolinChain: ChainConfig = {
  id: ChainID.PANGOLIN,
  network: "pangolin-dvm",
  name: "Pangolin",
  logo: "pangolin.png",
  nativeCurrency: {
    name: "PRING",
    symbol: "PRING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://pangolin-rpc.darwinia.network"],
      webSocket: ["wss://pangolin-rpc.darwinia.network"],
    },
    public: {
      http: ["https://pangolin-rpc.darwinia.network"],
      webSocket: ["wss://pangolin-rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Subscan",
      url: "https://pangolin.subscan.io/",
    },
  },
  testnet: true,
  tokens: [],
};
