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
      address: "0x9Da7E18441f26515CC713290BE846E726d41781d",
      logo: "crab.svg",
      cross: [
        { target: { network: "crab-dvm", symbol: "CRAB" }, bridge: { category: "xtoken-sepolia" }, action: "redeem" },
      ],
    },
  ],
  messager: {
    msgline: "0xc876D0873e4060472334E297b2db200Ca10cc806",
  },
};
