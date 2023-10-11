"use client";

import { PropsWithChildren, ReactElement, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import TransferInput from "./transfer-input";
import CrossChainInfo from "./cross-chain-info";
import { getParsedCrossChain } from "@/utils/cross-chain";
import { BaseBridge } from "@/bridges/base";
import { useAccount, useBalance, useNetwork, usePublicClient, useWalletClient } from "wagmi";
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
import { Token } from "@/types/token";
import Faucet from "./faucet";
import { isProduction } from "@/utils/env";

const {
  defaultSourceOptions,
  defaultTargetOptions,
  defaultSourceValue,
  defaultTargetValue,
  defaultBridge,
  availableBridges,
  availableTargetOptions,
} = getParsedCrossChain();

export default function Transfer() {
  const { transferValue, setTransferValue } = useApp();
  const deferredTransferValue = useDeferredValue(transferValue);

  const [isOpen, _, setIsOpenTrue, setIsOpenFalse] = useToggle(false);
  const [isLoadingFee, setIsLoadingFee] = useState(false);

  const [sourceValue, setSourceValue] = useState(defaultSourceValue);
  const [targetValue, setTargetValue] = useState(defaultTargetValue);
  const [targetOptions, setTargetOptions] = useState(defaultTargetOptions);
  const [category, setCategory] = useState(defaultBridge);
  const [bridge, setBridge] = useState<BaseBridge>();
  const [allowance, setAllowance] = useState(0n);
  const [fee, setFee] = useState<{ value: bigint; token: Token }>();

  const { transferToken, sourceChainConfig } = useMemo(() => {
    const sourceChainConfig = getChainConfig(sourceValue?.network);
    const transferToken = sourceChainConfig?.tokens.find((t) => t.symbol === sourceValue?.symbol);
    return { transferToken, sourceChainConfig };
  }, [sourceValue]);

  const { chain } = useNetwork();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    enabled: chain && chain.id === sourceChainConfig?.id,
    token: transferToken?.type === "erc20" ? transferToken.address : undefined,
  });

  const {
    loading: isLoadingRelayers,
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
      setCategory(availableBridges[sourceValue.network]?.[targetValue.network]?.[sourceValue.symbol]?.at(0));
    } else {
      setCategory(undefined);
    }
  }, [sourceValue, targetValue]);

  useEffect(() => {
    if (sourceValue && targetValue && category) {
      setBridge(
        bridgeFactory({
          category,
          sourceChain: sourceValue.network,
          targetChain: targetValue.network,
          sourceToken: sourceValue.symbol,
          targetToken: targetValue.symbol,
          publicClient,
          walletClient,
        }),
      );
    } else {
      setBridge(undefined);
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

    if (bridge) {
      setIsLoadingFee(true);

      sub$$ = from(
        bridge.getFee({
          baseFee: relayer?.baseFee ? BigInt(relayer.baseFee) : undefined,
          liquidityFeeRate: relayer?.liquidityFeeRate ? BigInt(relayer.liquidityFeeRate) : undefined,
          transferAmount: deferredTransferValue.formatted,
        }),
      ).subscribe({
        next: setFee,
        error: (err) => {
          console.error(err);
          setFee(undefined);
          setIsLoadingFee(false);
        },
        complete: () => setIsLoadingFee(false),
      });
    } else {
      setFee(undefined);
    }

    return () => sub$$?.unsubscribe();
  }, [bridge, relayersData, deferredTransferValue]);

  return (
    <>
      <div className="p-middle bg-component gap-large mx-auto flex w-full flex-col rounded lg:w-[40rem] lg:gap-5 lg:p-5">
        {/* source */}
        <Section
          label="From"
          extra={
            isProduction() ? undefined : (
              <Faucet sourceChain={sourceValue?.network} sourceToken={sourceValue?.symbol} onSuccess={refetchBalance} />
            )
          }
          className="mt-8"
        >
          <TransferInput
            options={defaultSourceOptions}
            balance={balanceData?.value}
            chainToken={sourceValue}
            transferValue={transferValue}
            onAmountChange={setTransferValue}
            onChainTokenChange={(value) => {
              const targetOpts = availableTargetOptions[value.network]?.[value.symbol] || [];
              const network = targetOpts.at(0)?.network;
              const symbol = targetOpts.at(0)?.symbols.at(0);

              setTargetValue(network && symbol ? { network, symbol } : undefined);
              setSourceValue(value);
              setTargetOptions(targetOpts);
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

              if (sourceValueRef.current && targetValueRef.current) {
                const targetOpts =
                  availableTargetOptions[targetValueRef.current.network]?.[targetValueRef.current.symbol] || [];
                setTargetOptions(targetOpts);
              }

              setSourceValue(targetValueRef.current);
              setTargetValue(sourceValueRef.current);
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
                ? availableBridges[sourceValue.network]?.[targetValue.network]?.[sourceValue.symbol] || []
                : []
            }
            value={category}
            onChange={setCategory}
          />
        </Section>

        {/* information */}
        <Section label="Information" className="mt-8">
          <CrossChainInfo fee={fee} bridge={bridge} loading={isLoadingFee || isLoadingRelayers} />
        </Section>

        {/* action */}
        <TransferAction
          fee={fee?.value || 0n}
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

function Section({
  children,
  label,
  extra,
  className,
}: PropsWithChildren<{ label: string; extra?: ReactElement; className?: string }>) {
  return (
    <div className={`gap-small lg:gap-middle relative flex flex-col ${className}`}>
      <div className="absolute -top-8 left-0 flex w-full items-center justify-between">
        <span className="text-sm font-normal text-white">{label}</span>
        {extra}
      </div>
      {children}
    </div>
  );
}
