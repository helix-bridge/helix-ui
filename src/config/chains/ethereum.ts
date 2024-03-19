import { ChainConfig } from "@/types/chain";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";

export const ethereumChain: ChainConfig = {
  /**
   * Chain
   */
  ...mainnet,
  network: "ethereum",
  name: "Ethereum",

  /**
   * Custom
   */
  logo: "ethereum.png",
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
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9469d013805bffb7d3debe5e7839237e535ec483",
      logo: "ring.png",
      cross: [
        { target: { network: "arbitrum", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "darwinia-dvm", symbol: "RING" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "lpbridge-ethereum" },
          action: "redeem",
          baseFee: parseUnits("3000", 18),
          index: 0,
          hidden: true,
        },
        {
          target: { network: "darwinia-dvm", symbol: "RING" },
          bridge: { category: "helix-sub2ethv2(unlock)" },
          action: "redeem",
        },
      ],
      category: "ring",
    },
    {
      decimals: 18,
      symbol: "KTON",
      name: "KTON",
      type: "erc20",
      address: "0x9f284e1337a815fe77d2ff4ae46544645b20c5ff",
      logo: "kton.png",
      cross: [
        {
          target: { network: "darwinia-dvm", symbol: "KTON" },
          bridge: { category: "helix-sub2ethv2(unlock)" },
          action: "redeem",
        },
      ],
      category: "others",
    },
  ],
  messager: { msgline: "0x65Be094765731F394bc6d9DF53bDF3376F1Fc8B0" },
};
