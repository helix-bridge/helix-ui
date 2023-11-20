import { ChainConfig, ChainID } from "@/types/chain";

export const arbitrumGoerliChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.ARBITRUM_GOERLI,
  network: "arbitrum-goerli",
  name: "Arbitrum Goerli",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://goerli-rollup.arbitrum.io/rpc"],
    },
    public: {
      http: ["https://goerli-rollup.arbitrum.io/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://goerli.arbiscan.io/",
    },
  },
  testnet: true,

  /**
   * Custom
   */
  logo: "arbitrum.png",
  tokens: [
    {
      decimals: 18,
      symbol: "ETH",
      name: "ETH",
      type: "native",
      address: "0x0000000000000000000000000000000000000000",
      logo: "eth.svg",
      cross: [
        { target: { network: "goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-opposite" } },
        { target: { network: "linea-goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "zksync-goerli", symbol: "ETH" }, bridge: { category: "lnbridgev20-default" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDC",
      name: "USDC",
      type: "erc20",
      address: "0xBAD026e314a77e727dF643B02f63adA573a3757c",
      logo: "usdc.svg",
      cross: [
        { target: { network: "linea-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        // { target: { network: "zksync-goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "goerli", symbol: "USDC" }, bridge: { category: "lnbridgev20-opposite" } },
      ],
    },
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x543bf1AC41485dc78039b9351563E4Dd13A288cb",
      logo: "usdt.svg",
      cross: [
        { target: { network: "linea-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "mantle-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        // { target: { network: "zksync-goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-default" } },
        { target: { network: "goerli", symbol: "USDT" }, bridge: { category: "lnbridgev20-opposite" } },
      ],
    },
  ],
};
