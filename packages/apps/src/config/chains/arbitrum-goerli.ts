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
  testnet: true,
  tokens: [
    {
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x39dE82E1d9B8F62E11022FC3FC127a82F93fE47E",
      logo: "usdc.svg",
      cross: [
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x6d828718c1097A4C573bc25c638Cc05bF10dFeAF",
      logo: "usdt.svg",
      cross: [
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
