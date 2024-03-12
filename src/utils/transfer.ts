import { ChainConfig, Token, TokenCategory, TokenOption } from "@/types";
import { getChainConfig, getChainConfigs } from ".";

const allTokenOptions: Record<Exclude<TokenCategory, "others">, TokenOption> = {
  crab: { logo: "crab.svg", category: "crab", symbol: "CRAB" },
  eth: { logo: "eth.svg", category: "eth", symbol: "ETH" },
  ring: { logo: "ring.svg", category: "ring", symbol: "RING" },
  usdc: { logo: "usdc.svg", category: "usdc", symbol: "USDC" },
  usdt: { logo: "usdt.svg", category: "usdt", symbol: "USDT" },
};
const sortedTokenCategories: Exclude<TokenCategory, "others">[] = ["usdt", "usdc", "eth", "ring", "crab"];
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
  return sortedTokenCategories.filter((c) => availableTokenCategories.has(c)).map((c) => allTokenOptions[c]);
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
