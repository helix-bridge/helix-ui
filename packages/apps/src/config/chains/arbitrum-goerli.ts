import { ChainConfig, ChainID } from "@/types/chain";

export const arbitrumGoerliChain: ChainConfig = {
  id: ChainID.ARBITRUM_GOERLI,
  network: "arbitrum-goerli",
  name: "Arbitrum Goerli",
  logo: "arbitrum.png",
  nativeCurrency: {
    name: "ARB",
    symbol: "ARB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://goerli-rollup.arbitrum.io/rpc"],
    },
    public: {
      http: ["https://goerli-rollup.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://goerli.arbiscan.io/",
    },
  },
  tokens: [
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x39dE82E1d9B8F62E11022FC3FC127a82F93fE47E",
      logo: "usdc.svg",
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x6d828718c1097A4C573bc25c638Cc05bF10dFeAF",
      logo: "usdt.svg",
    },
  ],
};
