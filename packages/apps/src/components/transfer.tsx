"use client";

import { BridgeCategory, Network, TokenSymbol, getChainsConfig } from "helix.js";
import { PropsWithChildren, useRef, useState } from "react";
import { Item as TokenSelectItem, Value as TokenSelectValue } from "./token-select";
import TransferInput from "./transfer-input";
import Image from "next/image";
import Information from "./information";

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
  const [sourceValue, setSourceValue] = useState<TokenSelectValue | undefined>(
    sourceItems.length && sourceItems[0].symbols.length
      ? { network: sourceItems[0].network, symbol: sourceItems[0].symbols[0] }
      : undefined,
  );
  const [targetItems, setTargetItems] = useState<TokenSelectItem[]>(
    sourceValue ? availableTargetItems.targetItems[sourceValue.network]?.[sourceValue.symbol] || [] : [],
  );
  const [targetValue, setTargetValue] = useState<TokenSelectValue | undefined>(
    targetItems.length && targetItems[0].symbols.length
      ? { network: targetItems[0].network, symbol: targetItems[0].symbols[0] }
      : undefined,
  );

  const fromValueRef = useRef(sourceValue);
  const toValueRef = useRef(targetValue);

  return (
    <div className="p-middle bg-component gap-large mx-auto flex w-full flex-col rounded lg:w-[40rem] lg:gap-5 lg:p-5">
      {/* source */}
      <Section label="From" className="mt-8">
        <TransferInput items={sourceItems} value={sourceValue} />
      </Section>

      {/* switch */}
      <div className="flex justify-center">
        <button className="transition hover:scale-105 hover:opacity-80 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:opacity-100">
          <Image width={36} height={36} alt="Switch" src="/images/switch.svg" />
        </button>
      </div>

      {/* target */}
      <Section label="To">
        <TransferInput items={targetItems} value={targetValue} isTarget />
      </Section>

      {/* information */}
      <Section label="Information" className="mt-8">
        <Information />
      </Section>

      {/* action */}
      <button className="bg-primary inline-flex h-10 shrink-0 items-center justify-center rounded">
        <span className="text-sm font-medium text-white">Transfer</span>
      </button>
    </div>
  );
}

function Section({ children, label, className }: PropsWithChildren<{ label: string; className?: string }>) {
  return (
    <div className={`gap-small lg:gap-middle relative flex flex-col ${className}`}>
      <div className="absolute -top-8 left-0">
        <span className="text-sm font-normal text-white">{label}</span>
      </div>
      {children}
    </div>
  );
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
