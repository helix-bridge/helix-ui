import { ChainConfig, ChainID } from "@/types/chain";

export const arbitrumChain: ChainConfig = {
  id: ChainID.ARBITRUM,
  network: "arbitrum",
  name: "Arbitrum One",
  logo: "arbitrum.png",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://arb1.arbitrum.io/rpc"],
    },
    public: {
      http: ["https://arb1.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://arbiscan.io/",
    },
  },
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
      address: "0x9e523234D36973f9e38642886197D023C88e307e",
      logo: "ring.svg",
      cross: [
        { target: { network: "ethereum", symbol: "RING" }, bridge: { category: "lnbridgev20-opposite" } },
        { target: { network: "darwinia-dvm", symbol: "RING" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "polygon", symbol: "RING" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 6,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      logo: "usdt.svg",
      cross: [
        { target: { network: "mantle", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "bsc", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
