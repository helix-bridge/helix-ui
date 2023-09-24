"use client";

import { PropsWithChildren, useDeferredValue, useEffect, useRef, useState } from "react";
import TransferInput from "./transfer-input";
import CrossChainInfo from "./cross-chain-info";
import { getCrossChain, getParsedCrossChain } from "@/utils/cross-chain";
import { BaseBridge } from "@/bridges/base";
import { BridgeCategory } from "@/types/bridge";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { bridgeFactory } from "@/utils/bridge";
import { useQuery } from "@apollo/client";
import { RelayersResponseData, RelayersVariables } from "@/types/graphql";
import { QUERY_RELAYERS } from "@/config/gql";
import { getChainConfig } from "@/utils/chain";
import BridgeSelect from "./bridge-select";
import SwitchCross from "./switch-cross";
import { from, Subscription } from "rxjs";
import { useToggle } from "@/hooks/use-toggle";
import TransferModal from "./transfer-modal";
import { useApp } from "@/hooks/use-app";
import TransferAction from "./transfer-action";
import DisclaimerModal from "./disclaimer-modal";

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
  const { transferValue, setTransferValue } = useApp();
  const deferredTransferValue = useDeferredValue(transferValue);

  const [isOpen, _, setIsOpenTrue, setIsOpenFalse] = useToggle(false);
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  const [sourceValue, setSourceValue] = useState(defaultSourceValue);
  const [targetValue, setTargetValue] = useState(defaultTargetValue);
  const [targetOptions, setTargetOptions] = useState(defaultTargetChainTokens);
  const [category, setCategory] = useState<BridgeCategory | null | undefined>(defaultCategory);
  const [bridge, setBridge] = useState<BaseBridge | null>();
  const [allowance, setAllowance] = useState(0n);
  const [fee, setFee] = useState(0n);
  const [transferToken, setTransferToken] = useState(
    getChainConfig(defaultSourceValue?.network)?.tokens.find(({ symbol }) => sourceValue?.symbol === symbol),
  );

  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: transferToken?.type === "erc20" ? transferToken.address : undefined,
  });

  const {
    loading: isRelayersLoading,
    data: relayersData,
    refetch: refetchRelayers,
  } = useQuery<RelayersResponseData, RelayersVariables>(QUERY_RELAYERS, {
    variables: {
      amount: deferredTransferValue.formatted.toString(),
      decimals: transferToken?.decimals,
      bridge: category,
      token: transferToken?.address,
      fromChain: sourceValue?.network,
      toChain: targetValue?.network,
    },
  });

  const sourceValueRef = useRef(sourceValue);
  const targetValueRef = useRef(targetValue);

  useEffect(() => {
    if (sourceValue && targetValue) {
      setCategory(availableBridges[sourceValue.network]?.[targetValue.network]?.[sourceValue.symbol]?.at(0)?.category);
    } else {
      setCategory(null);
    }
  }, [sourceValue, targetValue]);

  useEffect(() => {
    if (sourceValue && targetValue && category) {
      setBridge(
        bridgeFactory({
          category,
          contract: crossChain[sourceValue.network]?.[targetValue.network]?.[category]?.contract,
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

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && bridge) {
      sub$$ = from(bridge.getAllowance(address)).subscribe({
        next: setAllowance,
        error: (err) => {
          console.error(err);
          setAllowance(0n);
        },
      });
    } else {
      setAllowance(0n);
    }

    return () => sub$$?.unsubscribe();
  }, [address, bridge]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    const relayer = relayersData?.sortedLnv20RelayInfos?.at(0);

    if (bridge && relayer) {
      setIsFeeLoading(true);

      from(
        bridge.getFee(
          BigInt(relayer.baseFee || 0),
          BigInt(relayer.liquidityFeeRate || 0),
          deferredTransferValue.formatted,
        ),
      ).subscribe({
        next: (res) => {
          setFee(res || 0n);
        },
        error: (err) => {
          console.error(err);
          setFee(0n);
        },
        complete: () => {
          setIsFeeLoading(false);
        },
      });
    }

    return () => sub$$?.unsubscribe();
  }, [bridge, relayersData, deferredTransferValue]);

  return (
    <>
      <div className="p-middle bg-component gap-large mx-auto flex w-full flex-col rounded lg:w-[40rem] lg:gap-5 lg:p-5">
        {/* source */}
        <Section label="From" className="mt-8">
          <TransferInput
            options={sourceChainTokens}
            balance={balanceData?.value}
            chainToken={sourceValue}
            transferValue={transferValue}
            onAmountChange={setTransferValue}
            onChainTokenChange={(value) => {
              setSourceValue(value);
              setTransferToken(getChainConfig(value.network)?.tokens.find(({ symbol }) => value.symbol === symbol));

              const network = availableTargetChainTokens[value.network]?.[value.symbol]?.at(0)?.network;
              const symbol = availableTargetChainTokens[value.network]?.[value.symbol]?.at(0)?.symbols.at(0);
              setTargetValue(network && symbol ? { network, symbol } : undefined);
              setTargetOptions(availableTargetChainTokens[value.network]?.[value.symbol] || []);
            }}
            type="source"
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
              setTargetOptions(
                targetValueRef.current
                  ? availableTargetChainTokens[targetValueRef.current.network]?.[targetValueRef.current.symbol] || []
                  : [],
              );
              setTransferToken(
                getChainConfig(targetValueRef.current?.network)?.tokens.find(
                  ({ symbol }) => targetValueRef.current?.symbol === symbol,
                ),
              );
            }}
          />
        </div>

        {/* target */}
        <Section label="To">
          <TransferInput
            options={targetOptions}
            chainToken={targetValue}
            onChainTokenChange={setTargetValue}
            type="target"
          />
        </Section>

        {/* bridge */}
        <Section label="Bridge" className="mt-8">
          <BridgeSelect
            options={
              sourceValue && targetValue
                ? (availableBridges[sourceValue.network]?.[targetValue.network]?.[sourceValue.symbol] || []).map(
                    (b) => b.category,
                  )
                : []
            }
            value={category}
            onChange={setCategory}
          />
        </Section>

        {/* information */}
        <Section label="Information" className="mt-8">
          <CrossChainInfo
            fee={fee}
            bridge={bridge}
            loading={isFeeLoading || isRelayersLoading}
            sourceValue={sourceValue}
          />
        </Section>

        {/* action */}
        <TransferAction
          fee={fee}
          allowance={allowance}
          bridge={bridge}
          sourceValue={sourceValue}
          targetValue={targetValue}
          transferValue={deferredTransferValue}
          onAllowanceChange={setAllowance}
          onTransfer={setIsOpenTrue}
        />
      </div>

      <TransferModal
        fee={fee}
        sender={address}
        recipient={address}
        bridge={bridge}
        sourceValue={sourceValue}
        targetValue={targetValue}
        transferValue={deferredTransferValue}
        isOpen={isOpen}
        onClose={setIsOpenFalse}
        onSuccess={() => {
          setTransferValue({ value: "", formatted: 0n });
          refetchBalance();
          setIsOpenFalse();
        }}
        onAllowanceChange={setAllowance}
        refetchRelayers={refetchRelayers}
      />

      <DisclaimerModal />
    </>
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
