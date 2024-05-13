import { ChainConfig, ChainID } from "@/types";

export const taikoHeklaChain: ChainConfig = {
  id: ChainID.TAIKO_HEKLA,
  network: "taiko-hekla",
  name: "Taiko Hekla",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hekla.taiko.xyz"],
    },
    public: {
      http: ["https://rpc.hekla.taiko.xyz"],
    },
  },
  blockExplorers: {
    default: { name: "Taikoscan", url: "https://hekla.taikoscan.network" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 59757,
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
      address: "0x463D1730a8527CA58d48EF70C7460B9920346567",
      logo: "usdt.png",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "USDT" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "usdt",
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x89AF830781A2C1d3580Db930bea11094F55AfEae",
      logo: "usdc.png",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "USDC" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "usdc",
    },
  ],
};
