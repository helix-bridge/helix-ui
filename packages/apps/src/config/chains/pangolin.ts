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
  tokens: [
    {
      decimals: 18,
      symbol: "PRING",
      name: "PRING",
      type: "erc20",
      address: "0x3F3eDBda6124462a09E071c5D90e072E0d5d4ed4",
      logo: "ring.svg",
    },
  ],
};
