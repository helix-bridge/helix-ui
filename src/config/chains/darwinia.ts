import { ChainConfig, ChainID } from "../../types/chain";

export const darwiniaChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.DARWINIA,
  network: "darwinia-dvm",
  name: "Darwinia",
  nativeCurrency: {
    name: "RING",
    symbol: "RING",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.darwinia.network"],
      webSocket: ["wss://rpc.darwinia.network"],
    },
    public: {
      http: ["https://rpc.darwinia.network"],
      webSocket: ["wss://rpc.darwinia.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.darwinia.network/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 251739,
    },
  },

  /**
   * Custom
   */
  logo: "darwinia.png",
  tokens: [
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "ring.png",
      cross: [
        { target: { network: "ethereum", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "opposite" } },
        { target: { network: "arbitrum", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        {
          target: { network: "crab-dvm", symbol: "xWRING" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
          hidden: true,
        },
        {
          target: { network: "polygon", symbol: "RING" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "ring",
    },
    {
      decimals: 18,
      symbol: "KTON",
      name: "KTON",
      type: "erc20",
      address: "0x0000000000000000000000000000000000000402",
      logo: "kton.png",
      cross: [],
      category: "others",
    },
    {
      decimals: 18,
      symbol: "xWCRAB",
      name: "xWCRAB",
      type: "erc20",
      address: "0x656567Eb75b765FC320783cc6EDd86bD854b2305",
      logo: "crab.png",
      cross: [
        {
          target: { network: "crab-dvm", symbol: "CRAB" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
          hidden: true,
        },
      ],
      category: "crab",
    },
    {
      decimals: 6,
      symbol: "ahUSDT",
      name: "ahUSDT",
      type: "erc20",
      address: "0x0000000000000000000000000000000000000403",
      logo: "usdt.png",
      cross: [
        {
          target: { network: "moonbeam", symbol: "xcUSDT" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "usdt",
    },
    {
      decimals: 10,
      symbol: "ahPINK",
      name: "ahPINK",
      type: "erc20",
      address: "0x0000000000000000000000000000000000000404",
      logo: "pink.png",
      cross: [
        {
          target: { network: "moonbeam", symbol: "xcPINK" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "pink",
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
