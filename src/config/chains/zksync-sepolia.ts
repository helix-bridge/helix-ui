import { ChainConfig } from "@/types/chain";
import { zkSyncSepoliaTestnet } from "viem/chains";

export const zksyncSepoliaChain: ChainConfig = {
  /**
   * Chain
   */
  ...zkSyncSepoliaTestnet,
  network: "zksync-sepolia",
  name: "zkSync Sepolia Testnet",

  /**
   * Custom
   */
  logo: "zksync.png",
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
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0x253adBFE99Fcd096B9b5502753F96CF78D42eaD0",
      logo: "usdc.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x3350f1ef046e21E052dCbA60Fc575919CCaFEdeb",
      logo: "usdt.png",
      cross: [],
    },
  ],
};
