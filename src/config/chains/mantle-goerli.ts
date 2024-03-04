import { ChainConfig } from "@/types/chain";
import { mantleTestnet } from "viem/chains";

export const mantleGoerliChain: ChainConfig = {
  /**
   * Chain
   */
  ...mantleTestnet,
  network: "mantle-goerli",
  name: "Mantle Testnet",

  /**
   * Custom
   */
  logo: "mantle.svg",
  tokens: [
    {
      decimals: 18,
      symbol: "MNT",
      name: "MNT",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "mnt.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xD610DE267f7590D5bCCE89489ECd2C1A4AfdF76B",
      logo: "usdc.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xDb06D904AC5Bdff3b8E6Ac96AFedd3381d94CFDD",
      logo: "usdt.png",
      cross: [],
    },
  ],
  hidden: true,
};
