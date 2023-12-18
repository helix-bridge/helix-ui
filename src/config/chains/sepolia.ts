import { ChainConfig } from "@/types";
import { sepolia } from "viem/chains";

export const sepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...sepolia,
  network: "sepolia",
  name: "Sepolia",

  /**
   * Custom
   */
  logo: "sepolia.png",
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
      symbol: "xCRAB",
      name: "xCRAB",
      type: "erc20",
      address: "0xe8835bb0735fbfd5ecac1e20835d5b7c39622ba3",
      logo: "crab.svg",
      cross: [
        { target: { network: "crab-dvm", symbol: "CRAB" }, bridge: { category: "xtoken-sepolia" }, action: "redeem" },
      ],
    },
  ],
  messager: {
    msgline: "0x527B67a61C6E1344C359Af2e241aAFeb0c3a9DE9",
  },
};
