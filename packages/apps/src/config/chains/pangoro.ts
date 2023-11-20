import { ChainConfig, ChainID } from "@/types/chain";

export const pangoroChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.PANGORO,
  network: "pangoro-dvm",
  name: "Pangoro",
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
  testnet: true,

  /**
   * Custom
   */
  logo: "pangoro.png",
  tokens: [],
};
