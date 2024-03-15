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
      logo: "eth.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "RING",
      name: "RING",
      type: "erc20",
      address: "0x9469d013805bffb7d3debe5e7839237e535ec483",
      logo: "ring.svg",
      cross: [
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
          hidden: true,
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
          hidden: true,
        },
      ],
    },
  ],
};
