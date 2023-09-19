"use client";

import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { Item as TokenSelectItem, Value as TokenSelectValue } from "./token-select";
import TransferInput from "./transfer-input";
import Image from "next/image";
import CrossChainInfo from "./cross-chain-info";
import { getCrossChain, getParsedCrossChain } from "@/utils/cross-chain";
import { BaseBridge } from "@/bridges/base";
import { BridgeCategory } from "@/types/bridge";
import { usePublicClient, useWalletClient } from "wagmi";
import { bridgeFactory } from "@/utils/bridge";
import { useQuery } from "@apollo/client";
import { RelayersResponseData, RelayersVariables } from "@/types/graphql";
import { QUERY_RELAYERS } from "@/config/gql";
import { getChainConfig } from "@/utils/chain";
import { Network } from "@/types/chain";
import BridgeSelect from "./bridge-select";

const { sourceChainTokens, availableBridges, availableTargetChainTokens } = getParsedCrossChain();
const crossChain = getCrossChain();

export default function Transfer() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

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
  const [amount, setAmount] = useState(0n);
  const [category, setCategory] = useState<BridgeCategory | null | undefined>(
    sourceValue && targetValue
      ? availableBridges[sourceValue.network]?.[targetValue.network]?.[sourceValue.symbol]?.at(0)?.category
      : null,
  );
  const [bridge, setBridge] = useState<BaseBridge | null>();

  const token = useMemo(
    () => getChainConfig(sourceValue?.network)?.tokens.find(({ symbol }) => sourceValue?.symbol === symbol),
    [sourceValue],
  );

  const { loading, data: relayers } = useQuery<RelayersResponseData, RelayersVariables>(QUERY_RELAYERS, {
    variables: {
      amount: amount.toString(),
      decimals: token?.decimals || 0,
      bridge: (category || "") as BridgeCategory,
      token: token?.address || "",
      fromChain: (sourceValue?.network || "") as Network,
      toChain: (targetValue?.network || "") as Network,
    },
  });

  useEffect(() => {
    if (sourceValue && targetValue && category) {
      const contract = crossChain[sourceValue.network]?.[targetValue.network]?.[category]?.contract;
      setBridge(
        bridgeFactory({
          category,
          contract,
          sourceChain: sourceValue.network,
          targetChain: targetValue.network,
          sourceToken: sourceValue.symbol,
          targetToken: targetValue.symbol,
          publicClient,
          walletClient,
        }),
      );
    } else {
      setBridge(null);
    }
  }, [category, sourceValue, targetValue, publicClient, walletClient]);

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

      <Section label="Bridge" className="mt-8">
        <BridgeSelect
          sourceChain={sourceValue?.network}
          targetChain={targetValue?.network}
          token={sourceValue?.symbol}
          value={category}
          onChange={setCategory}
        />
      </Section>

      {/* information */}
      <Section label="Information" className="mt-8">
        <CrossChainInfo
          amount={amount}
          token={token}
          bridge={bridge}
          relayer={relayers?.sortedLnv20RelayInfos?.at(0)}
          externalLoading={loading}
        />
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
