import { ChainConfig, ChainID } from "@/types/chain";

export const arbitrumChain: ChainConfig = {
  id: ChainID.ARBITRUM,
  network: "arbitrum",
  name: "Arbitrum One",
  logo: "arbitrum.png",
  nativeCurrency: {
    name: "ARB",
    symbol: "ARB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://arb1.arbitrum.io/rpc"],
    },
    public: {
      http: ["https://arb1.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://arbiscan.io/",
    },
  },
  tokens: [],
};
