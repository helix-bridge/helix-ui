import { crossChain } from "@/config/cross-chain";
import { BridgeCategory } from "@/types/bridge";
import { Network } from "@/types/chain";
import { AvailableBridges, AvailableTargetChainTokens, ChainTokens } from "@/types/cross-chain";
import { TokenSymbol } from "@/types/token";

const sourceChainTokens: ChainTokens[] = [];
let availableBridges: AvailableBridges = {};
let availableTargetChainTokens: AvailableTargetChainTokens = {};

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

  sourceChainTokens.push({ network: sourceChain, symbols: Array.from(sourceTokens) });
});

export function getParsedCrossChain() {
  return { sourceChainTokens, availableBridges, availableTargetChainTokens };
}

export function getCrossChain() {
  return crossChain;
}
