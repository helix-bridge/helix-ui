import { HelixChain } from "@helixbridge/helixconf";
import { BridgeV2Type, ChainConfig, ChainID, Network } from "../../types";
import { Address } from "viem";

const chain = HelixChain.bera;
const tokens = chain.tokens.map((token) => {
  const couples = chain.filterCouples({ symbolFrom: token.symbol });
  const category = couples.at(0)?.category ?? "Others";

  const routes = new Set<string>();
  for (const couple of couples) {
    routes.add(`${couple.chain.code}:${couple.symbol.from}:${couple.symbol.to}`);
  }

  const cross = [...routes].map((route) => {
    const [toChain, fromToken, toToken] = route.split(":");
    const lnv2 = couples.find(
      (c) =>
        c.chain.code === toChain &&
        c.symbol.from === fromToken &&
        c.symbol.to === toToken &&
        (c.protocol.name === "lnv2-default" || c.protocol.name === "lnv2-opposite"),
    );
    return {
      target: { network: toChain as Network, symbol: toToken },
      bridge: {
        category: "lnbridge" as const,
        lnv2Type: (lnv2?.protocol.name === "lnv2-opposite" ? "opposite" : "default") as BridgeV2Type,
        disableV2: !lnv2,
      },
    };
  });
  return { ...token, address: token.address as Address, category, cross };
});

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
  tokens,
};
