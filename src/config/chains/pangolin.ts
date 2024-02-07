import { ChainConfig, ChainID } from "@/types/chain";

export const pangolinChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.PANGOLIN,
  network: "pangolin-dvm",
  name: "Pangolin",
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

  /**
   * Custom
   */
  logo: "pangolin.png",
  tokens: [
    {
      decimals: 18,
      symbol: "PRING",
      name: "PRING",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "ring.svg",
      cross: [
        { target: { network: "sepolia", symbol: "xPRING" }, bridge: { category: "xtoken-pangolin" }, action: "issue" },
      ],
    },
  ],
};
