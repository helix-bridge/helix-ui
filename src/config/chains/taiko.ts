import { ChainConfig, ChainID } from "@/types";

export const taikoChain: ChainConfig = {
  id: ChainID.TAIKO,
  network: "taiko",
  name: "Taiko Katla",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.katla.taiko.xyz"],
    },
    public: {
      http: ["https://rpc.katla.taiko.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Taikoscan", url: "https://katla.taikoscan.network" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
  },
  testnet: true,

  logo: "taiko.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.png",
      cross: [],
      category: "eth",
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x89AF830781A2C1d3580Db930bea11094F55AfEae",
      logo: "usdt.png",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "USDT" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
      ],
      category: "usdt",
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x3F7DF5866591e7E48D18C8EbeAE61Bc343a63283",
      logo: "usdc.png",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "USDC" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
      ],
      category: "usdc",
    },
  ],
};
