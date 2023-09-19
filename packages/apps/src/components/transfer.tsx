"use client";

import { PropsWithChildren, useState } from "react";
import { Item as TokenSelectItem, Value as TokenSelectValue } from "./token-select";
import TransferInput from "./transfer-input";
import Image from "next/image";
import Information from "./information";
import { getParsedCrossChain } from "@/utils/cross-chain";

const { sourceChainTokens, availableBridges, availableTargetChainTokens } = getParsedCrossChain();

export default function Transfer() {
  const [sourceValue, setSourceValue] = useState<TokenSelectValue | undefined>(
    sourceChainTokens.length && sourceChainTokens[0].symbols.length
      ? { network: sourceChainTokens[0].network, symbol: sourceChainTokens[0].symbols[0] }
      : undefined,
  );

  const [targetItems, setTargetItems] = useState<TokenSelectItem[]>(
    sourceValue ? availableTargetChainTokens[sourceValue.network]?.[sourceValue.symbol] || [] : [],
  );
  const [targetValue, setTargetValue] = useState<TokenSelectValue | undefined>(
    targetItems.length && targetItems[0].symbols.length
      ? { network: targetItems[0].network, symbol: targetItems[0].symbols[0] }
      : undefined,
  );

  return (
    <div className="p-middle bg-component gap-large mx-auto flex w-full flex-col rounded lg:w-[40rem] lg:gap-5 lg:p-5">
      {/* source */}
      <Section label="From" className="mt-8">
        <TransferInput items={sourceChainTokens} value={sourceValue} />
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
      <button className="bg-primary inline-flex h-10 shrink-0 items-center justify-center rounded transition hover:opacity-80 active:translate-y-1">
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
