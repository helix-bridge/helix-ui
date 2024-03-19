import { ChainConfig, ChainID } from "@/types/chain";
import { parseUnits } from "viem";

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
      name: "Subscan",
      url: "https://darwinia.subscan.io/",
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
          target: { network: "crab-dvm", symbol: "xWRING" },
          bridge: { category: "xtoken-darwinia-dvm" },
          action: "issue",
        },
        {
          target: { network: "ethereum", symbol: "RING" },
          bridge: { category: "lpbridge-darwinia-dvm" },
          action: "issue",
          baseFee: parseUnits("3000", 18),
          index: 0,
          price: 440000n,
          hidden: true,
        },
        {
          target: { network: "ethereum", symbol: "RING" },
          bridge: { category: "helix-sub2ethv2(lock)" },
          action: "issue",
          min: 1000000000000000000000000n,
        },
        {
          target: { network: "polygon", symbol: "RING" },
          bridge: { category: "lnbridge", lnv2Type: "default", disableV2: true },
        },
      ],
      category: "ring",
    },
    // {
    //   decimals: 18,
    //   symbol: "WRING",
    //   name: "WRING",
    //   type: "erc20",
    //   address: "0x",
    //   logo: "ring.png",
    //   cross: [],
    // },
    {
      decimals: 18,
      symbol: "KTON",
      name: "KTON",
      type: "erc20",
      address: "0x0000000000000000000000000000000000000402",
      logo: "kton.png",
      cross: [
        {
          target: { network: "ethereum", symbol: "KTON" },
          bridge: { category: "helix-sub2ethv2(lock)" },
          action: "issue",
        },
      ],
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
        {
          target: { network: "crab-dvm", symbol: "CRAB" },
          bridge: { category: "xtoken-darwinia-dvm" },
          action: "redeem",
        },
      ],
      category: "crab",
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
