import { ChainConfig, ChainID } from "@/types";

export const beraChain: ChainConfig = {
  id: ChainID.BERA,
  network: "bera",
  name: "Berachain Artio",
  nativeCurrency: {
    name: "BERA",
    symbol: "BERA",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://artio.rpc.berachain.com/"],
    },
    public: {
      http: ["https://artio.rpc.berachain.com/"],
    },
  },
  blockExplorers: {
    default: { name: "Artio", url: "https://artio.beratrail.io" },
  },
  contracts: {
    multicall3: {
      address: "0x9d1dB8253105b007DDDE65Ce262f701814B91125",
    },
  },
  testnet: true,

  logo: "bera.png",
  tokens: [
    {
      decimals: 18,
      symbol: "USDT",
      name: "USDT",
      type: "erc20",
      address: "0x463D1730a8527CA58d48EF70C7460B9920346567",
      logo: "usdt.png",
      cross: [
        {
          target: { network: "arbitrum-sepolia", symbol: "USDT" },
          bridge: { category: "lnbridge", lnv2Type: "default" },
        },
      ],
      category: "usdt",
    },
  ],
};
