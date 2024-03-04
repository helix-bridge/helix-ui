import { ChainConfig } from "@/types";
import { gnosis } from "viem/chains";

export const gnosisChain: ChainConfig = {
  /**
   * Chain
   */
  ...gnosis,
  network: "gnosis",
  name: "Gnosis Chain",

  /**
   * Custom
   */
  logo: "gnosis.png",
  tokens: [
    {
      decimals: 18,
      symbol: "xDai",
      name: "xDai",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "xdai.png",
      cross: [],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6",
      logo: "usdt.png",
      cross: [],
    },
  ],
};
