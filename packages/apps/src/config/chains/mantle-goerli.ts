import { ChainConfig, ChainID } from "@/types/chain";

export const mantleGoerliChain: ChainConfig = {
  id: ChainID.MANTLE_GOERLI,
  network: "mantle-goerli",
  name: "Mantle Testnet",
  logo: "mantle.svg",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.mantle.xyz"],
      webSocket: ["wss://rpc.testnet.mantle.xyz"],
    },
    public: {
      http: ["https://rpc.testnet.mantle.xyz"],
      webSocket: ["wss://rpc.testnet.mantle.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Mantle",
      url: "https://explorer.testnet.mantle.xyz/",
    },
  },
  testnet: true,
  tokens: [
    {
      decimals: 18,
      symbol: "MNT",
      name: "MNT",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "mnt.svg",
      cross: [{ target: { network: "goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-default" } }],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xD610DE267f7590D5bCCE89489ECd2C1A4AfdF76B",
      logo: "usdc.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "arbitrum-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0xDb06D904AC5Bdff3b8E6Ac96AFedd3381d94CFDD",
      logo: "usdt.svg",
      cross: [
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "arbitrum-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
  ],
};
