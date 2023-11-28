"use client";

import { GQL_SORTED_LNV20_RELAY_INFOS } from "@/config";
import { useToggle, useTransfer } from "@/hooks";
import {
  BridgeCategory,
  ChainConfig,
  SortedLnV20RelayInfosReqParams,
  SortedLnV20RelayInfosResData,
  Token,
  UrlSearchParamKey,
} from "@/types";
import {
  getAvailableBridges,
  getAvailableSourceTokens,
  getAvailableTargetChains,
  getAvailableTargetTokens,
  getCrossDefaultValue,
  isProduction,
} from "@/utils";
import { useQuery } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Address, useAccount } from "wagmi";
import { Subscription, from } from "rxjs";
import Label from "@/ui/label";
import ChainSelect from "./chain-select";
import SwitchCrossIcon from "@/ui/switch-cross-icon";
import Faucet from "./faucet";
import { BalanceInput } from "./balance-input";
import BridgeSelect from "./bridge-select";
import TransferInfo from "./transfer-info";
import TransferAction from "./transfer-action";
import TransferModal from "./modals/transfer-modal";
import DisclaimerModal from "./modals/disclaimer-modal";

const { defaultSourceChains } = getCrossDefaultValue();

export default function Transfer() {
  const {
    bridgeFee,
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    sourceBalance,
    bridgeInstance,
    bridgeCategory,
    transferAmount,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    setTargetToken,
    setTransferAmount,
    setBridgeFee,
    setBridgeCategory,
    updateSourceBalance,
  } = useTransfer();
  const deferredTransferAmount = useDeferredValue(transferAmount);

  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);
  const { address } = useAccount();

  const [recipient, _setRecipient] = useState<Address>();
  const [isLoadingFee, setIsLoadingFee] = useState(false);
  const [estimateGasFee, setEstimateGasFee] = useState(0n);
  const [balanceLoading, setBalanceLoading] = useState(false);

  const bridgeOptions = useMemo(
    () => getAvailableBridges(sourceChain, targetChain, sourceToken),
    [sourceChain, targetChain, sourceToken],
  );

  const {
    loading: isLoadingRelayers,
    data: relayersData,
    refetch: refetchRelayers,
  } = useQuery<SortedLnV20RelayInfosResData, SortedLnV20RelayInfosReqParams>(GQL_SORTED_LNV20_RELAY_INFOS, {
    variables: {
      amount: deferredTransferAmount.value.toString(),
      decimals: sourceToken?.decimals,
      bridge: bridgeCategory,
      token: sourceToken?.address,
      fromChain: sourceChain?.network,
      toChain: targetChain?.network,
    },
    skip: !bridgeInstance?.isLnBridge(),
  });

  const transferable = useMemo(() => {
    let result: bigint | undefined;
    const maxMargin = relayersData?.sortedLnv20RelayInfos?.maxMargin;

    if (sourceBalance) {
      const { token, value: balance } = sourceBalance;
      result = result === undefined ? balance : result < balance ? result : balance;
      if (bridgeFee?.token.symbol === token.symbol) {
        result = bridgeFee.value < result ? result - bridgeFee.value : 0n;
      }
    }
    if (maxMargin) {
      const mm = BigInt(maxMargin);
      result = result === undefined ? mm : result < mm ? result : mm;
    }
    if (result !== undefined) {
      result = estimateGasFee < result ? result - estimateGasFee : 0n;
    }
    return result;
  }, [bridgeFee, estimateGasFee, sourceBalance, relayersData]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const handleUrlParams = ({
    _category,
    _sourceChain,
    _targetChain,
    _sourceToken,
    _targetToken,
  }: {
    _category?: BridgeCategory;
    _sourceChain?: ChainConfig;
    _targetChain?: ChainConfig;
    _sourceToken?: Token;
    _targetToken?: Token;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const c = _category || bridgeCategory;
    const sc = _sourceChain || sourceChain;
    const tc = _targetChain || targetChain;
    const st = _sourceToken || sourceToken;
    const tt = _targetToken || targetToken;

    c && params.set(UrlSearchParamKey.BRIDGE, c);
    sc && params.set(UrlSearchParamKey.SOURCE_CHAIN, sc.network);
    tc && params.set(UrlSearchParamKey.TARGET_CHAIN, tc.network);
    st && params.set(UrlSearchParamKey.SOURCE_TOKEN, st.symbol);
    tt && params.set(UrlSearchParamKey.TARGET_TOKEN, tt.symbol);
    router.push(`?${params.toString()}`);
  };

  const refreshBalance = useCallback(async () => {
    if (address && bridgeInstance) {
      setBalanceLoading(true);
      await updateSourceBalance(address, bridgeInstance);
      setBalanceLoading(false);
    }
  }, [address, bridgeInstance, updateSourceBalance]);

  useEffect(() => {
    setBridgeCategory(bridgeOptions.at(0));
  }, [bridgeOptions, setBridgeCategory]);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    const relayer = relayersData?.sortedLnv20RelayInfos?.records.at(0);

    if (bridgeInstance) {
      setIsLoadingFee(true);
      sub$$ = from(
        bridgeInstance.getFee({
          baseFee: BigInt(relayer?.baseFee || 0),
          protocolFee: BigInt(relayer?.protocolFee || 0),
          liquidityFeeRate: BigInt(relayer?.liquidityFeeRate || 0),
          transferAmount: deferredTransferAmount.value,
        }),
      ).subscribe({
        next: setBridgeFee,
        error: (err) => {
          console.error(err);
          setBridgeFee(undefined);
          setIsLoadingFee(false);
        },
        complete: () => setIsLoadingFee(false),
      });
    } else {
      setBridgeFee(undefined);
    }

    return () => sub$$?.unsubscribe();
  }, [bridgeInstance, relayersData, deferredTransferAmount, setBridgeFee]);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    const relayer = relayersData?.sortedLnv20RelayInfos?.records.at(0);

    // Note: native token

    if (bridgeInstance && sourceToken?.type === "native" && address && deferredTransferAmount.value) {
      sub$$ = from(
        bridgeInstance.estimateTransferGasFee(address, recipient ?? address, deferredTransferAmount.value, {
          relayer: relayer?.relayer,
          transferId: relayer?.lastTransferId,
          totalFee: bridgeFee?.value,
          withdrawNonce: BigInt(relayer?.withdrawNonce || 0),
          depositedMargin: BigInt(relayer?.margin || 0),
        }),
      ).subscribe({
        next: (gasFee) => {
          setEstimateGasFee(gasFee ?? 0n);
        },
        error: (err) => {
          console.error(err);
          setEstimateGasFee(0n);
        },
      });
    } else {
      setEstimateGasFee(0n);
    }

    return () => sub$$?.unsubscribe();
  }, [bridgeInstance, sourceToken, bridgeFee, address, recipient, deferredTransferAmount, relayersData]);

  return (
    <>
      <div className="p-middle bg-component gap-large rounded-large mx-auto flex w-full flex-col lg:mt-20 lg:w-[30rem] lg:gap-5 lg:p-5">
        {/* From-To */}
        <div className="gap-small lg:gap-large mt-8 flex items-center">
          <Label text="From" className="w-full" needAbsolute>
            <ChainSelect
              className="p-middle bg-inner w-full"
              placement="bottom-start"
              value={sourceChain}
              options={defaultSourceChains}
              onChange={(_sourceChain) => {
                const _targetChains = getAvailableTargetChains(_sourceChain);
                const _targetChain = _targetChains.at(0);
                const _sourceTokens = getAvailableSourceTokens(_sourceChain, _targetChain);
                const _sourceToken = _sourceTokens.at(0);
                const _targetTokens = getAvailableTargetTokens(_sourceChain, _targetChain, _sourceToken);
                const _targetToken = _targetTokens.at(0);
                const _category = getAvailableBridges(_sourceChain, _targetChain, _sourceToken).at(0);

                setBridgeCategory(_category);
                setSourceChain(_sourceChain);
                setTargetChain(_targetChain);
                setSourceToken(_sourceToken);
                setTargetToken(_targetToken);
                handleUrlParams({ _category, _sourceChain, _targetChain, _sourceToken, _targetToken });
              }}
            />
          </Label>
          <SwitchCrossIcon
            disabled={!getAvailableBridges(targetChain, sourceChain, targetToken).length}
            onClick={() => {
              const _sourceChain = targetChain ? { ...targetChain } : undefined;
              const _targetChain = sourceChain ? { ...sourceChain } : undefined;
              const _sourceToken = targetToken ? { ...targetToken } : undefined;
              const _targetToken = sourceToken ? { ...sourceToken } : undefined;
              const _category = getAvailableBridges(_sourceChain, _targetChain, _sourceToken).at(0);

              setBridgeCategory(_category);
              setSourceChain(_sourceChain);
              setTargetChain(_targetChain);
              setSourceToken(_sourceToken);
              setTargetToken(_targetToken);
              handleUrlParams({ _category, _sourceChain, _targetChain, _sourceToken, _targetToken });
            }}
          />
          <Label text="To" className="w-full" needAbsolute>
            <ChainSelect
              className="p-middle bg-inner w-full"
              placement="bottom-end"
              value={targetChain}
              options={getAvailableTargetChains(sourceChain)}
              onChange={(_targetChain) => {
                const _sourceTokens = getAvailableSourceTokens(sourceChain, _targetChain);
                const _sourceToken = _sourceTokens.at(0);
                const _targetTokens = getAvailableTargetTokens(sourceChain, _targetChain, _sourceToken);
                const _targetToken = _targetTokens.at(0);
                const _category = getAvailableBridges(sourceChain, _targetChain, _sourceToken).at(0);

                setBridgeCategory(_category);
                setTargetChain(_targetChain);
                setSourceToken(_sourceToken);
                setTargetToken(_targetToken);
                handleUrlParams({ _category, _targetChain, _sourceToken, _targetToken });
              }}
            />
          </Label>
        </div>

        {/* Amount */}
        <Label text="Amount" extra={isProduction() ? null : <Faucet />}>
          <BalanceInput
            enabledDynamicStyle
            balance={sourceBalance?.value}
            max={transferable}
            value={transferAmount}
            token={sourceToken}
            balanceLoading={balanceLoading}
            tokenOptions={getAvailableSourceTokens(sourceChain, targetChain)}
            onBalanceRefresh={refreshBalance}
            onChange={setTransferAmount}
            onTokenChange={setSourceToken}
          />
        </Label>

        {/* Bridge */}
        <Label text="Bridge" className={`${bridgeOptions.length > 1 ? "" : "hidden"}`}>
          <BridgeSelect
            options={bridgeOptions}
            value={bridgeCategory}
            onChange={(_category) => {
              setBridgeCategory(_category);
              handleUrlParams({ _category });
            }}
          />
        </Label>

        {/* Information */}
        <Label text="Information">
          <TransferInfo
            fee={bridgeFee ? { ...bridgeFee, loading: isLoadingFee || isLoadingRelayers } : undefined}
            bridge={bridgeInstance}
            maxMargin={relayersData?.sortedLnv20RelayInfos?.maxMargin}
            isLoadingMaxMargin={isLoadingRelayers}
          />
        </Label>

        {/* Action */}
        <TransferAction
          transferable={transferable}
          transferAmount={deferredTransferAmount}
          recipient={recipient || address}
          onTransfer={setIsOpenTrue}
        />
      </div>

      <TransferModal
        sender={address}
        recipient={recipient || address}
        transferAmount={deferredTransferAmount}
        isOpen={isOpen}
        onClose={() => {
          setIsOpenFalse();
          setTransferAmount({ input: "", valid: true, value: 0n });
        }}
        refetchRelayers={refetchRelayers}
      />

      <DisclaimerModal />
    </>
  );
}
