import { ChainConfig, ChainID } from "@/types/chain";
import { parseUnits } from "viem";

export const ethereumChain: ChainConfig = {
  id: ChainID.ETHEREUM,
  network: "ethereum",
  name: "Ethereum",
  logo: "ethereum.png",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://mainnet.infura.io/v3/5350449ccd2349afa007061e62ee1409"],
      webSocket: ["wss://mainnet.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409"],
    },
    public: {
      http: ["https://mainnet.infura.io/v3/5350449ccd2349afa007061e62ee1409"],
      webSocket: ["wss://mainnet.infura.io/ws/v3/5350449ccd2349afa007061e62ee1409"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://etherscan.io/",
    },
  },
  tokens: [
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9469d013805bffb7d3debe5e7839237e535ec483",
      logo: "ring.svg",
      cross: [
        { target: { network: "arbitrum", symbol: "RING" }, bridge: { category: "l2arbitrumbridge-ethereum" } },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "helix-sub2ethv2(unlock)" },
          action: "redeem",
        },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "lpbridge-ethereum" },
          action: "redeem",
          baseFee: parseUnits("3000", 18),
          index: 0,
        },
      ],
    },
    {
      decimals: 18,
      symbol: "KTON",
      name: "KTON",
      type: "erc20",
      address: "0x9f284e1337a815fe77d2ff4ae46544645b20c5ff",
      logo: "kton.svg",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "KTON" },
          bridge: { category: "helix-sub2ethv2(unlock)" },
          action: "redeem",
        },
      ],
    },
  ],
};
