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
      cross: [{ target: { network: "goerli", symbol: "MNT" }, bridge: { category: "lnbridge", lnv2Type: "default" } }],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xD610DE267f7590D5bCCE89489ECd2C1A4AfdF76B",
      logo: "usdc.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        {
          target: { network: "arbitrum-goerli", symbol: "USDC" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "zksync-goerli", symbol: "USDC" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xDb06D904AC5Bdff3b8E6Ac96AFedd3381d94CFDD",
      logo: "usdt.png",
      cross: [
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        {
          target: { network: "arbitrum-goerli", symbol: "USDT" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
        { target: { network: "zksync-goerli", symbol: "USDT" }, bridge: { category: "lnbridge", lnv2Type: "default" } },
      ],
    },
  ],
  hidden: true,
};
