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
      logo: "eth.svg",
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
  ],
};
