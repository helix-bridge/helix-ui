import { BridgeCategory } from "@/types/bridge";
import { AvailableBridges, AvailableTargetChains, AvailableTargets, ChainToken, ChainTokens } from "@/types/misc";
import { TokenSymbol } from "@/types/token";
import { getChainsConfig } from "./chain";
import { Network } from "@/types/chain";

const defaultSourceOptions: ChainTokens[] = [];
const defaultTargetOptions: ChainTokens[] = [];

let defaultSourceValue: ChainToken | undefined;
let defaultTargetValue: ChainToken | undefined;
let defaultBridge: BridgeCategory | undefined;

let availableTargetOptions: AvailableTargets = {};
let availableBridges: AvailableBridges = {};

const defaultTargetChains = new Set<Network>();
let availableTargetChains: AvailableTargetChains = {};

getChainsConfig().forEach(({ tokens, network }, sourceChainIndex) => {
  const sourceTokens = new Set<TokenSymbol>();

  tokens.forEach((token, sourceTokenIndex) => {
    token.cross.forEach((cross) => {
      if (!cross.hidden) {
        defaultSourceValue = defaultSourceValue ?? { network, symbol: token.symbol };
        defaultTargetValue = defaultTargetValue ?? cross.target;
        defaultBridge = defaultBridge ?? cross.bridge.category;

        sourceTokens.add(token.symbol);
        if (!sourceChainIndex && !sourceTokenIndex) {
          defaultTargetOptions.push({ network: cross.target.network, symbols: [cross.target.symbol] });
        }

        defaultTargetChains.add(cross.target.network);
        availableTargetChains = {
          ...availableTargetChains,
          [network]: (availableTargetChains[network] || []).concat(cross.target.network),
        };

        availableTargetOptions = {
          ...availableTargetOptions,
          [network]: {
            ...availableTargetOptions[network],
            [token.symbol]: (availableTargetOptions[network]?.[token.symbol] || []).concat({
              network: cross.target.network,
              symbols: [cross.target.symbol],
            }),
          },
        };

        availableBridges = {
          ...availableBridges,
          [network]: {
            ...availableBridges[network],
            [cross.target.network]: {
              ...availableBridges[network]?.[cross.target.network],
              [token.symbol]: (availableBridges[network]?.[cross.target.network]?.[token.symbol] || []).concat(
                cross.bridge.category,
              ),
            },
          },
        };
      }
    });
  });

  if (sourceTokens.size) {
    defaultSourceOptions.push({ network, symbols: Array.from(sourceTokens) });
  }
});

export function getParsedCrossChain() {
  return {
    defaultSourceOptions,
    defaultTargetOptions,
    defaultSourceValue,
    defaultTargetValue,
    defaultBridge,
    availableTargetOptions,
    availableBridges,
    defaultTargetChains: Array.from(defaultTargetChains),
    availableTargetChains,
  };
}
