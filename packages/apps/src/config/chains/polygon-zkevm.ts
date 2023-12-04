import { ChainConfig, ChainID } from "@/types";

export const polygonZkEvmChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.POLYGON_ZKEVM,
  network: "polygon-zkEvm",
  name: "Polygon zkEVM",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://zkevm-rpc.com"],
      webSocket: [],
    },
    public: {
      http: ["https://zkevm-rpc.com"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Polygonscan",
      url: "https://zkevm.polygonscan.com/",
    },
  },

  /**
   * Custom
   */
  logo: "polygon.png",
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
      address: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d",
      logo: "usdt.png",
      cross: [
        { target: { network: "polygon", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
