"use client";

import { ButtonHTMLAttributes, PropsWithChildren, useDeferredValue, useEffect, useRef, useState } from "react";
import TransferInput from "./transfer-input";
import CrossChainInfo from "./cross-chain-info";
import { getCrossChain, getParsedCrossChain } from "@/utils/cross-chain";
import { BaseBridge } from "@/bridges/base";
import { BridgeCategory } from "@/types/bridge";
import { useAccount, useBalance, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { bridgeFactory } from "@/utils/bridge";
import { useQuery } from "@apollo/client";
import { RelayersResponseData, RelayersVariables } from "@/types/graphql";
import { QUERY_RELAYERS } from "@/config/gql";
import { getChainConfig } from "@/utils/chain";
import { Network } from "@/types/chain";
import BridgeSelect from "./bridge-select";
import SwitchCross from "./switch-cross";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const {
  defaultTargetChainTokens,
  sourceChainTokens,
  availableBridges,
  availableTargetChainTokens,
  defaultSourceValue,
  defaultTargetValue,
  defaultCategory,
} = getParsedCrossChain();
const crossChain = getCrossChain();

export default function Transfer() {
  const [sourceValue, setSourceValue] = useState(defaultSourceValue);
  const [targetValue, setTargetValue] = useState(defaultTargetValue);
  const [targetItems, setTargetItems] = useState(defaultTargetChainTokens);

  const [sourceChainConfig, setSourceChainConfig] = useState(getChainConfig(defaultSourceValue?.network));
  const [transferToken, setTransferToken] = useState(
    getChainConfig(defaultSourceValue?.network)?.tokens.find(({ symbol }) => sourceValue?.symbol === symbol),
  );
  const [category, setCategory] = useState<BridgeCategory | null | undefined>(defaultCategory);
  const [bridge, setBridge] = useState<BaseBridge | null>();
  const [amount, setAmount] = useState(0n);
  const deferredAmount = useDeferredValue(amount);

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData } = useBalance({
    address,
    token: transferToken?.type === "erc20" ? transferToken.address : undefined,
  });
  const { openConnectModal } = useConnectModal();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const { loading, data: relayers } = useQuery<RelayersResponseData, RelayersVariables>(QUERY_RELAYERS, {
    variables: {
      amount: deferredAmount.toString(),
      decimals: transferToken?.decimals || 0,
      bridge: (category || "") as BridgeCategory,
      token: transferToken?.address || "",
      fromChain: (sourceValue?.network || "") as Network,
      toChain: (targetValue?.network || "") as Network,
    },
  });

  const sourceValueRef = useRef(sourceValue);
  const targetValueRef = useRef(targetValue);

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
        <TransferInput
          items={sourceChainTokens}
          balance={balanceData?.value}
          value={sourceValue}
          onAmountChange={setAmount}
          onTokenChange={(value) => {
            setSourceValue(value);
            setSourceChainConfig(getChainConfig(value.network));
            setTransferToken(getChainConfig(value.network)?.tokens.find(({ symbol }) => value.symbol === symbol));

            const network = availableTargetChainTokens[value.network]?.[value.symbol]?.at(0)?.network;
            const symbol = availableTargetChainTokens[value.network]?.[value.symbol]?.at(0)?.symbols.at(0);
            setTargetValue(network && symbol ? { network, symbol } : undefined);
            setTargetItems(availableTargetChainTokens[value.network]?.[value.symbol] || []);
          }}
        />
      </Section>

      {/* switch */}
      <div className="flex justify-center">
        <SwitchCross
          disabled={
            !(
              sourceValue &&
              targetValue &&
              availableBridges[targetValue.network]?.[sourceValue.network]?.[targetValue.symbol]?.length
            )
          }
          onClick={() => {
            sourceValueRef.current = sourceValue;
            targetValueRef.current = targetValue;
            setSourceValue(targetValueRef.current);
            setTargetValue(sourceValueRef.current);
            setTargetItems(
              targetValueRef.current
                ? availableTargetChainTokens[targetValueRef.current.network]?.[targetValueRef.current.symbol] || []
                : [],
            );
            setTransferToken(
              getChainConfig(targetValueRef.current?.network)?.tokens.find(
                ({ symbol }) => targetValueRef.current?.symbol === symbol,
              ),
            );
            setSourceChainConfig(getChainConfig(targetValueRef.current?.network));
          }}
        />
      </div>

      {/* target */}
      <Section label="To">
        <TransferInput items={targetItems} value={targetValue} isTarget onTokenChange={setTargetValue} />
      </Section>

      {/* bridge */}
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
          amount={deferredAmount}
          token={transferToken}
          bridge={bridge}
          relayer={relayers?.sortedLnv20RelayInfos?.at(0)}
          externalLoading={loading}
        />
      </Section>

      {/* action */}
      {chain ? (
        sourceChainConfig && chain.id !== sourceChainConfig.id ? (
          <ActionButton onClick={() => switchNetwork && switchNetwork(sourceChainConfig.id)}>
            Switch Network
          </ActionButton>
        ) : (
          <ActionButton>Transfer</ActionButton>
        )
      ) : (
        <ActionButton onClick={openConnectModal}>Connect Wallet</ActionButton>
      )}
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

function ActionButton({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="bg-primary inline-flex h-10 shrink-0 items-center justify-center rounded transition hover:opacity-80 active:translate-y-1 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      {...rest}
    >
      <span className="text-sm font-medium text-white">{children}</span>
    </button>
  );
}
