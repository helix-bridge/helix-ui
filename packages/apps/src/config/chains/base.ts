import { ChainConfig, ChainID } from "@/types/chain";

export const baseChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.BASE,
  network: "base",
  name: "Base",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.base.org"],
      webSocket: ["wss://base.publicnode.com"],
    },
    public: {
      http: ["https://mainnet.base.org"],
      webSocket: ["wss://base.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://basescan.org",
    },
  },

  /**
   * Custom
   */
  logo: "base.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      logo: "usdc.svg",
      cross: [{ target: { network: "bsc", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
