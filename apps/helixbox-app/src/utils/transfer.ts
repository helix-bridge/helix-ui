import { ChainConfig, CrossChain, Network, Token, TokenCategory, TokenOption } from "../types";
import { getChainConfig, getChainConfigs, isMainnet } from ".";

const BRIDGE_TOKEN_CATEGORY = "RING";
const BRIDGE_TOKEN_SYMBOL = "RING";
const BRIDGE_NETWORKS = new Set<Network>(["darwinia-dvm", "arbitrum"]);

function isVisibleBridgeCross(cross: CrossChain) {
  return (
    !cross.hidden &&
    cross.bridge.category === "lnbridge" &&
    BRIDGE_NETWORKS.has(cross.target.network) &&
    cross.target.symbol === BRIDGE_TOKEN_SYMBOL
  );
}

// ['ETH', 'RING', 'USDT', 'USDC', 'BTC', 'DAI', 'LINK', 'CRAB', 'PINK']
const allTokenOptions: Record<Exclude<TokenCategory, "others">, TokenOption> = {
  CRAB: { logo: "crab.png", category: "CRAB", symbol: "CRAB" },
  ETH: { logo: "eth.png", category: "ETH", symbol: "ETH" },
  RING: { logo: "ring.png", category: "RING", symbol: "RING" },
  USDC: { logo: "usdc.png", category: "USDC", symbol: "USDC" },
  USDT: { logo: "usdt.png", category: "USDT", symbol: "USDT" },
  PINK: { logo: "pink.png", category: "PINK", symbol: "PINK" },
  LINK: { logo: "link.png", category: "LINK", symbol: "LINK" },
  DAI: { logo: "dai.png", category: "DAI", symbol: "DAI" },
  BTC: { logo: "btc.png", category: "BTC", symbol: "BTC" },
};
const sortedTokenCategories: Exclude<TokenCategory, "others">[] = isMainnet() ? [BRIDGE_TOKEN_CATEGORY] : [];
const availableTokenCategories = new Set<TokenCategory>();
const sourceChainOptions = new Map<TokenCategory, ChainConfig[]>();

getChainConfigs()
  .filter(({ hidden, network }) => !hidden && BRIDGE_NETWORKS.has(network))
  .forEach((sourceChain) => {
    sourceChain.tokens
      .filter(({ category, symbol }) => category === BRIDGE_TOKEN_CATEGORY && symbol === BRIDGE_TOKEN_SYMBOL)
      .forEach((sourceToken) => {
        sourceToken.cross
          .filter(isVisibleBridgeCross)
          .forEach((cross) => {
            const targetChain = getChainConfig(cross.target.network);
            const targetToken = targetChain?.tokens.find(({ symbol }) => symbol === cross.target.symbol);

            if (targetToken?.category === BRIDGE_TOKEN_CATEGORY && targetChain && targetChain.id !== sourceChain.id) {
              availableTokenCategories.add(sourceToken.category);
              sourceChainOptions.set(
                sourceToken.category,
                (sourceChainOptions.get(sourceToken.category) || [])
                  .filter(({ id }) => id !== sourceChain.id)
                  .concat(sourceChain),
              );
            }
          });
      });
  });

export function getTokenOptions() {
  return sortedTokenCategories.filter((c) => availableTokenCategories.has(c)).map((c) => allTokenOptions[c]);
}

export function getSourceChainOptions(category: TokenCategory) {
  return sourceChainOptions.get(category) || [];
}

export function getSourceTokenOptions(sourceChain: ChainConfig, tokenCategory: TokenCategory) {
  return sourceChain.tokens.filter(
    ({ category, symbol, cross }) =>
      category === tokenCategory && symbol === BRIDGE_TOKEN_SYMBOL && cross.some(isVisibleBridgeCross),
  );
}

export function getTargetChainOptions(sourceToken: Token) {
  return sourceToken.cross
    .filter(isVisibleBridgeCross)
    .map(({ target }) => getChainConfig(target.network))
    .filter((c) => c) as ChainConfig[];
}

export function getTargetTokenOptions(sourceToken: Token, targetChain: ChainConfig) {
  return targetChain.tokens.filter(({ symbol }) =>
    sourceToken.cross.some(
      (c) =>
        isVisibleBridgeCross(c) &&
        c.target.symbol === symbol &&
        c.target.network === targetChain.network,
    ),
  );
}
