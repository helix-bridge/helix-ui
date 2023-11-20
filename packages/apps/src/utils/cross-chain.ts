import { BridgeCategory } from "@/types/bridge";
import {
  AvailableBridges,
  AvailableSourceTokens,
  AvailableTargetChains,
  AvailableTargetTokens,
  ChainConfig,
  Network,
  Token,
  TokenSymbol,
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

/**
 * For LnBridge relayer
 */
let lnbridgeDefaultSourceChains: ChainConfig[] = [];
let lnbridgeDefaultTargetChains: ChainConfig[] = [];
let lnbridgeAvailableSourceTokens: AvailableSourceTokens = {};
let lnbridgeAvailableTargetChains: AvailableTargetChains = {};

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

        if (cross.bridge.category === "lnbridgev20-default" || cross.bridge.category === "lnbridgev20-opposite") {
          lnbridgeDefaultSourceChains = lnbridgeDefaultSourceChains
            .filter((c) => c.id !== sourceChain.id)
            .concat(sourceChain);
          lnbridgeDefaultTargetChains = lnbridgeDefaultTargetChains
            .filter((c) => c.id !== targetChain.id)
            .concat(targetChain);

          lnbridgeAvailableSourceTokens = {
            ...lnbridgeAvailableSourceTokens,
            [sourceChain.network]: {
              ...lnbridgeAvailableSourceTokens[sourceChain.network],
              [targetChain.network]: (lnbridgeAvailableSourceTokens[sourceChain.network]?.[targetChain.network] || [])
                .filter((t) => t.symbol !== sourceToken.symbol)
                .concat(sourceToken),
            },
          };

          lnbridgeAvailableTargetChains = {
            ...lnbridgeAvailableTargetChains,
            [sourceChain.network]: (lnbridgeAvailableTargetChains[sourceChain.network] || [])
              .filter((c) => c.id !== targetChain.id)
              .concat(targetChain),
          };
        }
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

defaultSourceChains.sort((a, b) => a.name.localeCompare(b.name));
defaultTargetChains.sort((a, b) => a.name.localeCompare(b.name));
defaultSourceTokens.sort((a, b) => (a.type === "native" ? 1 : a.symbol.localeCompare(b.symbol)));
defaultTargetTokens.sort((a, b) => (a.type === "native" ? 1 : a.symbol.localeCompare(b.symbol)));

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

export function getAvailableBridge(
  sourceChain: Network | undefined,
  targetChain: Network | undefined,
  sourceToken: TokenSymbol | undefined,
) {
  if (sourceChain && targetChain && sourceToken) {
    return availableBridges[sourceChain]?.[targetChain]?.[sourceToken] || [];
  }
  return [];
}

export function getAvailableSourceTokens(sourceChain: Network | undefined, targetChain: Network | undefined) {
  if (sourceChain && targetChain) {
    return availableSourceTokens[sourceChain]?.[targetChain] || [];
  }
  return [];
}

export function getAvailableTargetChains(sourceChain: Network | undefined) {
  if (sourceChain) {
    return availableTargetChains[sourceChain] || [];
  }
  return [];
}

export function getAvailableTargetTokens(
  sourceChain: Network | undefined,
  targetChain: Network | undefined,
  sourceToken: TokenSymbol | undefined,
) {
  if (sourceChain && targetChain && sourceToken) {
    return availableTargetTokens[sourceChain]?.[targetChain]?.[sourceToken] || [];
  }
  return [];
}

export function getLnBridgeCrossDefaultValue() {
  return { defaultSourceChains: lnbridgeDefaultSourceChains, defaultTargetChains: lnbridgeDefaultTargetChains };
}

export function getLnBridgeAvailableSourceTokens(sourceChain: Network | undefined, targetChain: Network | undefined) {
  if (sourceChain && targetChain) {
    return lnbridgeAvailableSourceTokens[sourceChain]?.[targetChain] || [];
  }
  return [];
}

export function getLnBridgeAvailableTargetChains(sourceChain: Network | undefined) {
  if (sourceChain) {
    return lnbridgeAvailableTargetChains[sourceChain] || [];
  }
  return [];
}
