"use client";

import { PropsWithChildren, ReactElement, useDeferredValue, useEffect, useMemo, useState } from "react";
import CrossChainInfo from "./cross-chain-info";
import { getParsedCrossChain } from "@/utils/cross-chain";
import { Address, useAccount } from "wagmi";
import { useQuery } from "@apollo/client";
import { RelayersResponseData, RelayersVariables } from "@/types/graphql";
import { QUERY_RELAYERS } from "@/config/gql";
import BridgeSelect from "./bridge-select";
import SwitchCross from "./switch-cross";
import { from, Subscription } from "rxjs";
import { useToggle } from "@/hooks/use-toggle";
import TransferModal from "./transfer-modal";
import TransferAction from "./transfer-action";
import DisclaimerModal from "./disclaimer-modal";
import Faucet from "./faucet";
import { isProduction } from "@/utils/env";
import { useTransfer } from "@/hooks/use-transfer";
import ChainTokenSelect from "./chain-token-select";
import { BalanceInput } from "./balance-input";
import { ChainToken } from "@/types/misc";
import { BridgeCategory } from "@/types/bridge";
import { useRouter, useSearchParams } from "next/navigation";
import { UrlSearchParam } from "@/types/url";
import AddressInput from "./address-input";

const { defaultSourceOptions, defaultTargetOptions, availableBridges, availableTargetOptions } = getParsedCrossChain();

export default function Transfer() {
  const {
    bridgeClient,
    bridgeCategory,
    transferValue,
    sourceValue,
    targetValue,
    sourceBalance,
    fee,
    setBridgeCategory,
    setTransferValue,
    setSourceValue,
    setTargetValue,
    setFee,
  } = useTransfer();
  const deferredTransferValue = useDeferredValue(transferValue);

  const { address } = useAccount();
  const [width, setWidth] = useState(0);
  const [recipient, setRecipient] = useState<Address>();
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [targetOptions, setTargetOptions] = useState(defaultTargetOptions);

  const [isOpen, _, setIsOpenTrue, setIsOpenFalse] = useToggle(false);
  const bridgeOptions = useMemo(
    () =>
      sourceValue && targetValue
        ? availableBridges[sourceValue.chain.network]?.[targetValue.chain.network]?.[sourceValue.token.symbol] || []
        : [],
    [sourceValue, targetValue],
  );

  const {
    loading: isLoadingRelayers,
    data: relayersData,
    refetch: refetchRelayers,
  } = useQuery<RelayersResponseData, RelayersVariables>(QUERY_RELAYERS, {
    variables: {
      amount: deferredTransferValue.formatted.toString(),
      decimals: sourceValue?.token.decimals,
      bridge: bridgeCategory,
      token: sourceValue?.token.address,
      fromChain: sourceValue?.chain.network,
      toChain: targetValue?.chain.network,
    },
    skip: !bridgeClient?.isLnBridge(),
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleUrlParams = ({
    _category,
    _sourceValue,
    _targetValue,
  }: {
    _category?: BridgeCategory;
    _sourceValue?: ChainToken;
    _targetValue?: ChainToken;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const c = _category || bridgeCategory;
    const s = _sourceValue || sourceValue;
    const t = _targetValue || targetValue;

    if (c) {
      params.set(UrlSearchParam.BRIDGE, c);
    }
    if (s) {
      params.set(UrlSearchParam.SOURCE_CHAIN, s.chain.network);
      params.set(UrlSearchParam.SOURCE_TOKEN, s.token.symbol);
    }
    if (t) {
      params.set(UrlSearchParam.TARGET_CHAIN, t.chain.network);
      params.set(UrlSearchParam.TARGET_TOKEN, t.token.symbol);
    }
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    if (sourceValue && targetValue) {
      setBridgeCategory(
        availableBridges[sourceValue.chain.network]?.[targetValue.chain.network]?.[sourceValue.token.symbol]?.at(0),
      );
    } else {
      setBridgeCategory(undefined);
    }
  }, [sourceValue, targetValue, setBridgeCategory]);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    const relayer = relayersData?.sortedLnv20RelayInfos?.at(0);

    if (bridgeClient) {
      setIsLoadingFee(true);
      sub$$ = from(
        bridgeClient.getFee({
          baseFee: BigInt(relayer?.baseFee || 0),
          protocolFee: BigInt(relayer?.protocolFee || 0),
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
  }, [bridgeClient, relayersData, deferredTransferValue, setFee]);

  return (
    <>
      <div className="p-middle bg-component gap-large mx-auto flex w-full flex-col rounded lg:w-[32rem] lg:gap-5 lg:p-5">
        {/* from to */}
        <div
          className="gap-small mt-8 flex items-center justify-between lg:gap-5"
          ref={(node) => setWidth(node?.clientWidth || 0)}
        >
          <Section label="From" className="w-full">
            <ChainTokenSelect
              width={width}
              placement="bottom-start"
              options={defaultSourceOptions}
              value={sourceValue}
              onChange={(_sourceValue) => {
                const targetOpts =
                  availableTargetOptions[_sourceValue.chain.network]?.[_sourceValue.token.symbol] || [];
                const token = targetOpts.at(0)?.tokens.at(0);
                const chain = targetOpts.at(0)?.chain;
                const _targetValue = chain && token ? { chain, token } : undefined;
                const _category = _targetValue
                  ? availableBridges[_sourceValue.chain.network]?.[_targetValue.chain.network]?.[
                      _sourceValue.token.symbol
                    ]?.at(0)
                  : undefined;

                setBridgeCategory(_category);
                setTargetOptions(targetOpts);
                setTargetValue(_targetValue);
                setSourceValue(_sourceValue);
                handleUrlParams({ _category, _sourceValue, _targetValue });
              }}
            />
          </Section>
          <SwitchCross
            disabled={
              !(
                sourceValue &&
                targetValue &&
                availableBridges[targetValue.chain.network]?.[sourceValue.chain.network]?.[targetValue.token.symbol]
                  ?.length
              )
            }
            onClick={() => {
              const _sourceValue = targetValue ? { ...targetValue } : undefined;
              const _targetValue = sourceValue ? { ...sourceValue } : undefined;

              const targetOpts = _sourceValue
                ? availableTargetOptions[_sourceValue.chain.network]?.[_sourceValue.token.symbol] || []
                : [];
              const _category =
                _sourceValue && _targetValue
                  ? availableBridges[_sourceValue.chain.network]?.[_targetValue.chain.network]?.[
                      _sourceValue.token.symbol
                    ]?.at(0)
                  : undefined;

              setBridgeCategory(_category);
              setTargetOptions(targetOpts);
              setTargetValue(_targetValue);
              setSourceValue(_sourceValue);
              handleUrlParams({ _category, _sourceValue, _targetValue });
            }}
          />
          <Section label="To" className="w-full">
            <ChainTokenSelect
              width={width}
              placement="bottom-end"
              options={targetOptions}
              value={targetValue}
              onChange={(_targetValue) => {
                setTargetValue(_targetValue);
                handleUrlParams({ _targetValue });
              }}
            />
          </Section>
        </div>

        {/* amount */}
        <Section label="Amount" className="mt-8" extra={isProduction() ? undefined : <Faucet />}>
          <BalanceInput
            balance={sourceBalance?.value}
            token={sourceBalance?.token}
            value={transferValue}
            suffix
            dynamic
            onChange={setTransferValue}
          />
        </Section>

        <Section label="Recipient" className="mt-8 hidden">
          <AddressInput
            placeholder={address}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value as Address)}
          />
        </Section>

        {/* bridge */}
        <Section label="Bridge" className={`mt-8 ${bridgeOptions.length > 1 ? "" : "hidden"}`}>
          <BridgeSelect
            options={bridgeOptions}
            value={bridgeCategory}
            onChange={(_category) => {
              setBridgeCategory(_category);
              handleUrlParams({ _category });
            }}
          />
        </Section>

        {/* information */}
        <Section label="Information" className="mt-8">
          <CrossChainInfo
            fee={fee ? { ...fee, loading: isLoadingFee || isLoadingRelayers } : undefined}
            bridge={bridgeClient}
          />
        </Section>

        {/* action */}
        <TransferAction
          fee={fee}
          transferValue={deferredTransferValue}
          recipient={recipient || address}
          onTransfer={setIsOpenTrue}
        />
      </div>

      <TransferModal
        sender={address}
        recipient={recipient || address}
        transferValue={deferredTransferValue}
        isOpen={isOpen}
        onClose={setIsOpenFalse}
        onSuccess={() => {
          setTransferValue({ value: "", formatted: 0n });
          setIsOpenFalse();
        }}
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
