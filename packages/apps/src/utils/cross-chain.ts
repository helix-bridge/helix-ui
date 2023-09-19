import { crossChain } from "@/config/cross-chain";
import { BridgeCategory } from "@/types/bridge";
import { Network } from "@/types/chain";
import { AvailableBridges, AvailableTargetChainTokens, ChainToken, ChainTokens } from "@/types/cross-chain";
import { TokenSymbol } from "@/types/token";

let defaultTargetChainTokens: ChainTokens[] = [];
const sourceChainTokens: ChainTokens[] = [];
let availableBridges: AvailableBridges = {};
let availableTargetChainTokens: AvailableTargetChainTokens = {};
let defaultSourceValue: ChainToken | undefined;
let defaultTargetValue: ChainToken | undefined;
let defaultCategory: BridgeCategory | undefined;

(Object.keys(crossChain) as Network[]).forEach((sourceChain) => {
  const sourceTokens = new Set<TokenSymbol>();

  (Object.keys(crossChain[sourceChain] || {}) as Network[]).forEach((targetChain) => {
    (Object.keys(crossChain[sourceChain]?.[targetChain] || {}) as BridgeCategory[]).forEach((category) => {
      const contract = crossChain[sourceChain]?.[targetChain]?.[category]?.contract;
      const tokens = crossChain[sourceChain]?.[targetChain]?.[category]?.tokens;

      tokens?.forEach(({ sourceToken, targetToken, deprecated }) => {
        if (!deprecated) {
          sourceTokens.add(sourceToken);

          if (contract) {
            availableBridges = {
              ...availableBridges,
              [sourceChain]: {
                ...availableBridges[sourceChain],
                [targetChain]: {
                  ...availableBridges[sourceChain]?.[targetChain],
                  [sourceToken]: (availableBridges[sourceChain]?.[targetChain]?.[sourceToken] || []).concat({
                    category,
                    contract,
                  }),
                },
              },
            };
          }

          availableTargetChainTokens = {
            ...availableTargetChainTokens,
            [sourceChain]: {
              ...availableTargetChainTokens[sourceChain],
              [sourceToken]: (availableTargetChainTokens[sourceChain]?.[sourceToken] || []).concat({
                network: targetChain,
                symbols: [targetToken],
              }),
            },
          };
        }
      });
    });
  });

  if (sourceTokens.size) {
    sourceChainTokens.push({ network: sourceChain, symbols: Array.from(sourceTokens) });
  }
});

const sourceNetwork = sourceChainTokens.at(0)?.network;
const sourceSymbol = sourceChainTokens.at(0)?.symbols.at(0);
if (sourceNetwork && sourceSymbol) {
  defaultSourceValue = { network: sourceNetwork, symbol: sourceSymbol };
  defaultTargetChainTokens.push(...(availableTargetChainTokens[sourceNetwork]?.[sourceSymbol] || []));

  const targetNetwork = availableTargetChainTokens[sourceNetwork]?.[sourceSymbol]?.at(0)?.network;
  const targetSymbol = availableTargetChainTokens[sourceNetwork]?.[sourceSymbol]?.at(0)?.symbols.at(0);
  if (targetNetwork && targetSymbol) {
    defaultTargetValue = { network: targetNetwork, symbol: targetSymbol };

    defaultCategory = availableBridges[sourceNetwork]?.[targetNetwork]?.[sourceSymbol]?.at(0)?.category;
  }
}

export function getParsedCrossChain() {
  return {
    defaultTargetChainTokens,
    sourceChainTokens,
    availableBridges,
    availableTargetChainTokens,
    defaultSourceValue,
    defaultTargetValue,
    defaultCategory,
  };
}

export function getCrossChain() {
  return crossChain;
}
