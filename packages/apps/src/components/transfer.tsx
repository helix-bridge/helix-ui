import { BridgeCategory, Network, TokenSymbol, getChainsConfig } from "helix.js";
import { useRef, useState } from "react";
import { Item as TokenSelectItem, Value as TokenSelectValue } from "./token-select";

const sourceItems: TokenSelectItem[] = [];
const availableBridges: AvailableBridges = { bridges: {} };
const availableTargetItems: AvailableTargetItems = { targetItems: {} };

getChainsConfig().forEach(({ network, crossChain }) => {
  const sourceTokens = new Set<TokenSymbol>();
  const targetChains = Object.keys(crossChain) as Network[];

  targetChains.forEach((targetChain) => {
    const targetTokens = new Set<TokenSymbol>();

    const bridges = Object.keys(crossChain[targetChain] || {}) as BridgeCategory[];
    bridges.forEach((bridge) => {
      const tokens = crossChain[targetChain]?.[bridge]?.tokens;
      tokens?.forEach(({ sourceToken, targetToken }) => {
        sourceTokens.add(sourceToken);
        targetTokens.add(targetToken);

        availableBridges.bridges = {
          ...availableBridges.bridges,
          [network]: {
            ...availableBridges.bridges[network],
            [targetChain]: {
              ...availableBridges.bridges[network]?.[targetChain],
              [sourceToken]: (availableBridges.bridges[network]?.[targetChain]?.[sourceToken] || []).concat(bridge),
            },
          },
        };

        availableTargetItems.targetItems = {
          ...availableTargetItems.targetItems,
          [network]: {
            ...availableTargetItems.targetItems[network],
            [sourceToken]: (availableTargetItems.targetItems[network]?.[sourceToken] || []).concat({
              network: targetChain,
              symbols: Array.from(targetTokens),
            }),
          },
        };
      });
    });
  });

  sourceItems.push({ network, symbols: Array.from(sourceTokens) });
});

export default function Transfer() {
  const [sourceValue, setSourceValue] = useState<TokenSelectValue | null>(
    sourceItems.length && sourceItems[0].symbols.length
      ? { network: sourceItems[0].network, symbol: sourceItems[0].symbols[0] }
      : null,
  );
  const [targetItems, setTargetItems] = useState<TokenSelectItem[]>(
    sourceValue ? availableTargetItems.targetItems[sourceValue.network]?.[sourceValue.symbol] || [] : [],
  );
  const [targetValue, setTargetValue] = useState<TokenSelectValue | null>(
    targetItems.length && targetItems[0].symbols.length
      ? { network: targetItems[0].network, symbol: targetItems[0].symbols[0] }
      : null,
  );

  const fromValueRef = useRef(sourceValue);
  const toValueRef = useRef(targetValue);

  return <div className="p-middle lg:p-5"></div>;
}

interface AvailableBridges {
  bridges: {
    [sourceChain in Network]?: {
      [targetChain in Network]?: {
        [sourceToken in TokenSymbol]?: BridgeCategory[];
      };
    };
  };
}

interface AvailableTargetItems {
  targetItems: {
    [sourceChain in Network]?: {
      [sourceToken in TokenSymbol]?: TokenSelectItem[];
    };
  };
}
