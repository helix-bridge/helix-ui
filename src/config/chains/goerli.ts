import { ChainConfig } from "@/types/chain";
import { goerli } from "viem/chains";

export const goerliChain: ChainConfig = {
  /**
   * Chain
   */
  ...goerli,
  network: "goerli",
  name: "Goerli",

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
      decimals: 6,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xe9784E0d9A939dbe966b021DE3cd877284DB1B99",
      logo: "usdc.svg",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xa39cffE89567eBfb5c306a07dfb6e5B3ba41F358",
      logo: "usdt.png",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "MNT",
      name: "MNT",
      type: "erc20",
      address: "0xc1dc2d65a2243c22344e725677a3e3bebd26e604",
      logo: "mnt.svg",
      cross: [],
    },
    {
      decimals: 18,
      symbol: "PRING",
      name: "PRING",
      type: "erc20",
      address: "0xeb93165E3CDb354c977A182AbF4fad3238E04319",
      logo: "ring.svg",
      cross: [],
    },
  ],
  hidden: true,
};
