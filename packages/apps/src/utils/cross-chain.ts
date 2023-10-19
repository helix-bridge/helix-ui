import { BridgeCategory } from "@/types/bridge";
import {
  AvailableBridges,
  AvailableTargetChains,
  AvailableTargets,
  AvailableTokens,
  ChainToken,
  ChainTokens,
} from "@/types/misc";
import { Token } from "@/types/token";
import { getChainConfig, getChainsConfig } from "./chain";
import { ChainConfig } from "@/types/chain";

const defaultSourceOptions: ChainTokens[] = [];
const defaultTargetOptions: ChainTokens[] = [];

let defaultSourceValue: ChainToken | undefined;
let defaultTargetValue: ChainToken | undefined;
let defaultBridge: BridgeCategory | undefined;

let availableTargetOptions: AvailableTargets = {};
let availableBridges: AvailableBridges = {};

// For LnRelayer (LnBridge)
let availableTokens: AvailableTokens = {};
let defaultSourceChains: ChainConfig[] = [];
let defaultTargetChains: ChainConfig[] = [];
let availableTargetChains: AvailableTargetChains = {};

getChainsConfig().forEach((sourceChain) => {
  let sourceTokens: Token[] = [];

  sourceChain.tokens.forEach((sourceToken) => {
    sourceToken.cross.forEach((cross) => {
      const targetChain = getChainConfig(cross.target.network);
      const targetToken = targetChain?.tokens.find((t) => t.symbol === cross.target.symbol);

      if (!cross.hidden && targetChain && targetToken) {
        sourceTokens = sourceTokens.filter((t) => t.symbol !== sourceToken.symbol).concat(sourceToken);

        defaultSourceValue = defaultSourceValue ?? { chain: sourceChain, token: sourceToken };
        defaultTargetValue = defaultTargetValue ?? { chain: targetChain, token: targetToken };
        defaultBridge = defaultBridge ?? cross.bridge.category;

        if (cross.bridge.category === "lnbridgev20-default" || cross.bridge.category === "lnbridgev20-opposite") {
          defaultSourceChains = defaultSourceChains.filter((c) => c.id !== sourceChain.id).concat(sourceChain);
          defaultTargetChains = defaultTargetChains.filter((c) => c.id !== targetChain.id).concat(targetChain);
          availableTargetChains = {
            ...availableTargetChains,
            [sourceChain.network]: (availableTargetChains[sourceChain.network] || [])
              .filter((c) => c.network !== cross.target.network)
              .concat(targetChain),
          };

          availableTokens = {
            ...availableTokens,
            [sourceChain.network]: {
              ...availableTokens[sourceChain.network],
              [cross.target.network]: (availableTokens[sourceChain.network]?.[cross.target.network] || [])
                .filter((t) => t.symbol !== sourceToken.symbol)
                .concat(sourceToken),
            },
          };
        }

        availableTargetOptions = {
          ...availableTargetOptions,
          [sourceChain.network]: {
            ...availableTargetOptions[sourceChain.network],
            [sourceToken.symbol]: (availableTargetOptions[sourceChain.network]?.[sourceToken.symbol] || [])
              .filter((t) => t.chain.network !== cross.target.network)
              .concat({
                chain: targetChain,
                tokens: [targetToken],
              }),
          },
        };

        availableBridges = {
          ...availableBridges,
          [sourceChain.network]: {
            ...availableBridges[sourceChain.network],
            [cross.target.network]: {
              ...availableBridges[sourceChain.network]?.[cross.target.network],
              [sourceToken.symbol]: (
                availableBridges[sourceChain.network]?.[cross.target.network]?.[sourceToken.symbol] || []
              ).concat(cross.bridge.category),
            },
          },
        };
      }
    });
  });

  if (sourceTokens.length) {
    defaultSourceOptions.push({ chain: sourceChain, tokens: sourceTokens });
  }
});

if (defaultSourceValue) {
  const opts = availableTargetOptions[defaultSourceValue.chain.network]?.[defaultSourceValue.token.symbol] || [];
  defaultTargetOptions.push(...opts);
}

defaultSourceOptions.sort((a, b) => a.chain.network.localeCompare(b.chain.network));
defaultTargetOptions.sort((a, b) => a.chain.network.localeCompare(b.chain.network));
defaultSourceChains.sort((a, b) => a.network.localeCompare(b.network));
defaultTargetChains.sort((a, b) => a.network.localeCompare(b.network));

export function getParsedCrossChain() {
  return {
    defaultSourceOptions,
    defaultTargetOptions,
    defaultSourceValue,
    defaultTargetValue,
    defaultBridge,
    availableTargetOptions,
    availableBridges,
    availableTokens,
    defaultSourceChains,
    defaultTargetChains,
    availableTargetChains,
  };
}
