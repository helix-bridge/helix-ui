import { ChainConfig, ChainID } from "@/types/chain";

export const mantleChain: ChainConfig = {
  id: ChainID.MANTLE,
  network: "mantle",
  name: "Mantle",
  logo: "mantle.svg",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mantle.xyz"],
      webSocket: ["wss://rpc.mantle.xyz"],
    },
    public: {
      http: ["https://rpc.mantle.xyz"],
      webSocket: ["wss://rpc.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle",
      url: "https://explorer.mantle.xyz/",
    },
  },
  tokens: [],
};
