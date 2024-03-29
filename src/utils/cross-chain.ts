import { BridgeCategory } from "@/types/bridge";
import {
  AvailableBridges,
  AvailableSourceTokens,
  AvailableTargetChains,
  AvailableTargetTokens,
  ChainConfig,
  Token,
} from "@/types";
import { getChainConfig, getChainConfigs } from "./chain";

let defaultBridgeCategory: BridgeCategory | undefined;

let defaultSourceChain: ChainConfig | undefined;
let defaultTargetChain: ChainConfig | undefined;

let defaultSourceToken: Token | undefined;
let defaultTargetToken: Token | undefined;

let defaultSourceChains: ChainConfig[] = [];
let defaultTargetChains: ChainConfig[] = [];

let defaultSourceTokens: Token[] = [];
let defaultTargetTokens: Token[] = [];

let availableSourceTokens: AvailableSourceTokens = {};
let availableTargetChains: AvailableTargetChains = {};
let availableTargetTokens: AvailableTargetTokens = {};
let availableBridges: AvailableBridges = {};

getChainConfigs().forEach((sourceChain) => {
  let sourceTokens: Token[] = [];

  sourceChain.tokens.forEach((sourceToken) => {
    sourceToken.cross.forEach((cross) => {
      const targetChain = getChainConfig(cross.target.network);
      const targetToken = targetChain?.tokens.find((t) => t.symbol === cross.target.symbol);

      if (!cross.hidden && targetChain && targetToken) {
        sourceTokens = sourceTokens.filter((t) => t.symbol !== sourceToken.symbol).concat(sourceToken);

        defaultBridgeCategory = defaultBridgeCategory ?? cross.bridge.category;
        defaultTargetChain = defaultTargetChain ?? targetChain;
        defaultTargetToken = defaultTargetToken ?? targetToken;

        availableSourceTokens = {
          ...availableSourceTokens,
          [sourceChain.network]: {
            ...availableSourceTokens[sourceChain.network],
            [targetChain.network]: (availableSourceTokens[sourceChain.network]?.[targetChain.network] || [])
              .filter((t) => t.symbol !== sourceToken.symbol)
              .concat(sourceToken),
          },
        };

        availableTargetChains = {
          ...availableTargetChains,
          [sourceChain.network]: (availableTargetChains[sourceChain.network] || [])
            .filter((c) => c.id != targetChain.id)
            .concat(targetChain),
        };

        availableTargetTokens = {
          ...availableTargetTokens,
          [sourceChain.network]: {
            ...availableTargetTokens[sourceChain.network],
            [targetChain.network]: {
              ...availableTargetTokens[sourceChain.network]?.[targetChain.network],
              [sourceToken.symbol]: (
                availableTargetTokens[sourceChain.network]?.[targetChain.network]?.[sourceToken.symbol] || []
              )
                .filter((t) => t.symbol !== targetToken.symbol)
                .concat(targetToken),
            },
          },
        };

        availableBridges = {
          ...availableBridges,
          [sourceChain.network]: {
            ...availableBridges[sourceChain.network],
            [targetChain.network]: {
              ...availableBridges[sourceChain.network]?.[targetChain.network],
              [sourceToken.symbol]: (
                availableBridges[sourceChain.network]?.[targetChain.network]?.[sourceToken.symbol] || []
              )
                .filter((category) => category !== cross.bridge.category)
                .concat(cross.bridge.category),
            },
          },
        };
      }
    });
  });

  if (sourceTokens.length) {
    defaultSourceChain = defaultSourceChain ?? sourceChain;
    defaultSourceToken = defaultSourceToken ?? sourceTokens[0];
    defaultSourceChains = defaultSourceChains.concat(sourceChain);
    defaultSourceTokens = defaultSourceTokens.length ? defaultSourceTokens : sourceTokens;
  }
});

if (defaultSourceChain) {
  defaultTargetChains = availableTargetChains[defaultSourceChain.network] || [];

  if (defaultTargetChain && defaultSourceToken) {
    defaultTargetTokens =
      availableTargetTokens[defaultSourceChain.network]?.[defaultTargetChain.network]?.[defaultSourceToken.symbol] ||
      [];
  }
}

function chainCompareFn(a: ChainConfig, b: ChainConfig) {
  return a.name.localeCompare(b.name);
}

function tokenCompareFn(a: Token, b: Token) {
  return a.type === "native" ? 1 : a.symbol.localeCompare(b.symbol);
}

defaultSourceChains.sort(chainCompareFn);
defaultTargetChains.sort(chainCompareFn);
defaultSourceTokens.sort(tokenCompareFn);
defaultTargetTokens.sort(tokenCompareFn);

export function getCrossDefaultValue() {
  return {
    defaultBridgeCategory,

    defaultSourceChain,
    defaultSourceToken,
    defaultSourceChains,
    defaultSourceTokens,

    defaultTargetChain,
    defaultTargetToken,
    defaultTargetChains,
    defaultTargetTokens,
  };
}

export function getAvailableBridges(
  sourceChain: ChainConfig | undefined,
  targetChain: ChainConfig | undefined,
  sourceToken: Token | undefined,
) {
  if (sourceChain && targetChain && sourceToken) {
    return availableBridges[sourceChain.network]?.[targetChain.network]?.[sourceToken.symbol] || [];
  }
  return [];
}

export function getAvailableSourceTokens(
  sourceChain: ChainConfig | undefined,
  targetChain: ChainConfig | undefined,
  defaultTokens: Token[] = [],
) {
  if (sourceChain && targetChain) {
    const result = (availableSourceTokens[sourceChain.network]?.[targetChain.network] || []).sort(tokenCompareFn);
    return result.length ? result : defaultTokens;
  }
  return defaultTokens;
}

export function getAvailableTargetChains(sourceChain: ChainConfig | undefined, defaultChains: ChainConfig[] = []) {
  if (sourceChain) {
    const result = (availableTargetChains[sourceChain.network] || []).sort(chainCompareFn);
    return result.length ? result : defaultChains;
  }
  return defaultChains;
}

export function getAvailableTargetTokens(
  sourceChain: ChainConfig | undefined,
  targetChain: ChainConfig | undefined,
  sourceToken: Token | undefined,
  defaultTokens: Token[] = [],
) {
  if (sourceChain && targetChain && sourceToken) {
    const result = (availableTargetTokens[sourceChain.network]?.[targetChain.network]?.[sourceToken.symbol] || []).sort(
      tokenCompareFn,
    );
    return result.length ? result : defaultTokens;
  }
  return defaultTokens;
}
