import { HelixChain } from "@helixbridge/helixconf";
import { ChainConfig, ChainID, Network } from "../../types/chain";
import { BridgeV2Type } from "../../types";
import { Address } from "viem";

const chain = HelixChain.astarZkevm;
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
  return { ...token, name: token.symbol, address: token.address as Address, category, cross };
});

if (chain.couples.length && !chain.tokens.some((t) => t.type === "native")) {
  tokens.push({
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/helix-bridge/helix-ui/main/packages/assets/images/tokens/eth.png",
    address: "0x0000000000000000000000000000000000000000",
    category: "ETH",
    type: "native",
    cross: [],
    alias: [],
  });
}

export const astarZkEvmChain: ChainConfig = {
  /**
   * Chain
   */
  id: ChainID.ASTAR_ZKEVM,
  network: "astar-zkevm",
  name: "Astar zkEVM",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.startale.com/astar-zkevm"],
      webSocket: [],
    },
    public: {
      http: ["https://rpc.startale.com/astar-zkevm"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://astar-zkevm.explorer.startale.com/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 183817,
    },
  },

  /**
   * Custom
   */
  logo: "astar.png",
  tokens,
};
