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
  tokens: [
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9e523234D36973f9e38642886197D023C88e307e",
      logo: "ring.svg",
      cross: [{ target: { network: "ethereum", symbol: "RING" }, bridge: { category: "lnbridgev20-opposite" } }],
    },
  ],
};
