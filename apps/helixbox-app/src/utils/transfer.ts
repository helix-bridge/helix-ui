import { ChainConfig, Token, TokenCategory, TokenOption } from "../types";
import { getChainConfig, getChainConfigs, isMainnet } from ".";

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
const sortedTokenCategories: Exclude<TokenCategory, "others">[] = isMainnet()
  ? ["USDC", "USDT", "ETH", "BTC", "DAI", "LINK", "RING", "CRAB", "PINK"]
  : ["USDC", "USDT", "ETH", "RING", "CRAB"];
const availableTokenCategories = new Set<TokenCategory>();
const sourceChainOptions = new Map<TokenCategory, ChainConfig[]>();

getChainConfigs()
  .filter(({ hidden }) => !hidden)
  .forEach((sourceChain) => {
    sourceChain.tokens
      .filter(({ category }) => sortedTokenCategories.some((c) => c === category))
      .forEach((sourceToken) => {
        sourceToken.cross
          .filter(({ hidden, bridge }) => !hidden && bridge.category === "lnbridge")
          .forEach((cross) => {
            const targetChain = getChainConfig(cross.target.network);
            const targetToken = targetChain?.tokens.find(({ symbol }) => symbol === cross.target.symbol);

            if (targetToken) {
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
  return sortedTokenCategories.filter((c) => availableTokenCategories.has(c) || true).map((c) => allTokenOptions[c]);
}

export function getSourceChainOptions(category: TokenCategory) {
  return sourceChainOptions.get(category) || [];
}

export function getSourceTokenOptions(sourceChain: ChainConfig, tokenCategory: TokenCategory) {
  return sourceChain.tokens.filter(
    ({ category, cross }) =>
      category === tokenCategory &&
      cross.filter(({ hidden, bridge }) => !hidden && bridge.category === "lnbridge").length,
  );
}

export function getTargetChainOptions(sourceToken: Token) {
  return sourceToken.cross
    .filter(({ hidden, bridge }) => !hidden && bridge.category === "lnbridge")
    .map(({ target }) => getChainConfig(target.network))
    .filter((c) => c) as ChainConfig[];
}

export function getTargetTokenOptions(sourceToken: Token, targetChain: ChainConfig) {
  return targetChain.tokens.filter(({ symbol }) =>
    sourceToken.cross.some(
      (c) =>
        !c.hidden &&
        c.target.symbol === symbol &&
        c.target.network === targetChain.network &&
        c.bridge.category === "lnbridge",
    ),
  );
}
