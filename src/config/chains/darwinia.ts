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
      outer: "0x0000000000000000000000000000000000000000",
      inner: "0xE7578598Aac020abFB918f33A20faD5B71d670b4",
      logo: "ring.png",
      cross: [
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
          hidden: true,
        },
        {
          target: { network: "ethereum", symbol: "RING" },
          bridge: { category: "xtoken-darwinia-dvm" },
          action: "issue",
        },
      ],
    },
    {
      decimals: 18,
      symbol: "KTON",
      name: "KTON",
      type: "erc20",
      address: "0x0000000000000000000000000000000000000402",
      outer: "0x0000000000000000000000000000000000000402",
      inner: "0x0000000000000000000000000000000000000402",
      logo: "kton.png",
      cross: [
        {
          target: { network: "ethereum", symbol: "KTON" },
          bridge: { category: "helix-sub2ethv2(lock)" },
          action: "issue",
          hidden: true,
        },
        {
          target: { network: "ethereum", symbol: "KTON" },
          bridge: { category: "xtoken-darwinia-dvm" },
          action: "issue",
        },
      ],
    },
    {
      decimals: 18,
      symbol: "xWCRAB",
      name: "xWCRAB",
      type: "erc20",
      address: "0x656567Eb75b765FC320783cc6EDd86bD854b2305",
      outer: "0x656567Eb75b765FC320783cc6EDd86bD854b2305",
      inner: "0x656567Eb75b765FC320783cc6EDd86bD854b2305",
      logo: "crab.png",
      cross: [
        {
          target: { network: "crab-dvm", symbol: "CRAB" },
          bridge: { category: "xtoken-darwinia-dvm" },
          action: "redeem",
        },
      ],
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
