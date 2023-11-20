import { ChainConfig, ChainID } from "@/types/chain";

export const baseGoerliChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.BASE_GOERLI,
  network: "base-goerli",
  name: "Base Goerli",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://goerli.base.org"],
      webSocket: ["wss://base-goerli.publicnode.com"],
    },
    public: {
      http: ["https://goerli.base.org"],
      webSocket: ["wss://base-goerli.publicnode.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Basescan",
      url: "https://goerli.basescan.org",
    },
  },
  testnet: true,

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
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x876A4f6eCF13EEb101F9E75FCeF58f19Ff383eEB",
      logo: "usdt.svg",
      cross: [{ target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } }],
    },
  ],
};
