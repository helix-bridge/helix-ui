"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import TransferTokenSection from "./transfer-token-section";
import {
  bridgeFactory,
  getSourceChainOptions,
  getSourceTokenOptions,
  getTargetChainOptions,
  getTargetTokenOptions,
  getTokenOptions,
  isSwitchAvailable,
  notifyError,
  notifyTransaction,
} from "@/utils";
import TransferChainSection from "./transfer-chain-section";
import TransferAmountSection from "./transfer-amount-section";
import TransferInformationSection from "./transfer-information-section";
import Button from "@/ui/button";
import { useAllowance, useBalance, useSortedRelayData, useTransactionFee, useTransferV2 } from "@/hooks";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import TransferProviderV2 from "@/providers/transfer-provider-v2";
import DisclaimerModal from "./modals/disclaimer-modal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Hex } from "viem";
import TransferModalV2 from "./modals/transfer-modal-v2";
import { useRouter, useSearchParams } from "next/navigation";
import { UrlSearchParamKey } from "@/types";

const tokenOptions = getTokenOptions();

function Component() {
  const [token, setToken] = useState(tokenOptions[0]);
  const [sourceChain, setSourceChain] = useState(getSourceChainOptions(token.category)[0]);
  const [sourceToken, setSourceToken] = useState(getSourceTokenOptions(sourceChain, token.category)[0]);
  const [targetChain, setTargetChain] = useState(getTargetChainOptions(sourceToken)[0]);
  const [targetToken, setTargetToken] = useState(getTargetTokenOptions(sourceToken, targetChain)[0]);

  const tokenRef = useRef(token);
  const sourceChainRef = useRef(sourceChain);
  const sourceTokenRef = useRef(sourceToken);
  const targetChainRef = useRef(targetChain);
  const targetTokenRef = useRef(targetToken);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const pT = params.get(UrlSearchParamKey.TOKEN_CATEGORY);
    const _token = tokenOptions.find(({ category }) => category === pT) || tokenOptions[0];

    const pSC = params.get(UrlSearchParamKey.SOURCE_CHAIN);
    const _sourceChainOptions = getSourceChainOptions(_token.category);
    const _sourceChain = _sourceChainOptions.find(({ network }) => network === pSC) || _sourceChainOptions[0];

    const pST = params.get(UrlSearchParamKey.SOURCE_TOKEN);
    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, _token.category);
    const _sourceToken = _sourceTokenOptions.find(({ symbol }) => symbol === pST) || _sourceTokenOptions[0];

    const pTC = params.get(UrlSearchParamKey.TARGET_CHAIN);
    const _targetChainOptions = getTargetChainOptions(_sourceToken);
    const _targetChain = _targetChainOptions.find(({ network }) => network === pTC) || _targetChainOptions[0];

    const pTT = params.get(UrlSearchParamKey.TARGET_CHAIN);
    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken = _targetTokenOptions.find(({ symbol }) => symbol === pTT) || _targetTokenOptions[0];

    setToken(_token);
    setSourceChain(_sourceChain);
    setSourceToken(_sourceToken);
    setTargetChain(_targetChain);
    setTargetToken(_targetToken);

    tokenRef.current = _token;
    sourceChainRef.current = _sourceChain;
    sourceTokenRef.current = _sourceToken;
    targetChainRef.current = _targetChain;
    targetTokenRef.current = _targetToken;
  }, []);

  const { amount, setAmount } = useTransferV2();
  const deferredAmount = useDeferredValue(amount);
  const [txHash, setTxHash] = useState<Hex | null>();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);

  const account = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const {
    balance,
    loading: loadingBalance,
    refresh: refreshBalance,
  } = useBalance(sourceChain, sourceToken, account.address);

  const { data: relayData, loading: loadingRelayData } = useSortedRelayData(
    deferredAmount.value,
    sourceToken,
    sourceChain,
    targetChain,
  );

  const bridge = useMemo(() => {
    const category = relayData?.sortedLnBridgeRelayInfos?.records.at(0)?.bridge;
    return category
      ? bridgeFactory({ category, walletClient, publicClient, sourceChain, sourceToken, targetChain, targetToken })
      : undefined;
  }, [
    relayData?.sortedLnBridgeRelayInfos?.records,
    walletClient,
    publicClient,
    sourceChain,
    sourceToken,
    targetChain,
    targetToken,
  ]);

  const { loading: loadingFee, fee } = useTransactionFee(
    bridge,
    account.address,
    account.address,
    deferredAmount.value,
    relayData,
  );

  const {
    allowance,
    loading: loadingAllowance,
    busy: isApproving,
    approve,
    refresh: refreshAllowance,
  } = useAllowance(sourceChain, sourceToken, account.address, bridge?.getContract()?.sourceAddress);

  const [actionText, disableAction] = useMemo(() => {
    let text: "Connect Wallet" | "Switch Chain" | "Approve" | "Transfer" = "Transfer";
    let disabled = false;

    if (chain?.id) {
      if (chain.id !== sourceChain.id) {
        text = "Switch Chain";
        disabled = false;
      } else if (
        allowance < (fee?.token.type === "native" ? deferredAmount.value : deferredAmount.value + (fee?.value ?? 0n))
      ) {
        text = "Approve";
        disabled = false;
      } else {
        text = "Transfer";
        disabled = loadingAllowance || fee?.value === undefined || !deferredAmount.input || !deferredAmount.valid;
      }
    } else {
      text = "Connect Wallet";
      disabled = false;
    }

    return [text, disabled];
  }, [allowance, loadingAllowance, chain?.id, deferredAmount, sourceChain.id, fee?.value, fee?.token.type]);

  const handleAction = useCallback(async () => {
    if (actionText === "Connect Wallet") {
      openConnectModal?.();
    } else if (actionText === "Switch Chain") {
      switchNetwork?.(sourceChain.id);
    } else if (actionText === "Approve") {
      const receipt = await approve(
        fee?.token.type === "native" ? deferredAmount.value : deferredAmount.value + (fee?.value ?? 0n),
      );
      notifyTransaction(receipt, sourceChain);
    } else if (actionText === "Transfer") {
      setIsOpen(true);
    }
  }, [
    actionText,
    sourceChain,
    deferredAmount.value,
    fee?.value,
    fee?.token.type,
    approve,
    openConnectModal,
    switchNetwork,
  ]);

  const handleTransfer = useCallback(async () => {
    if (bridge && account.address) {
      const relayInfo = relayData?.sortedLnBridgeRelayInfos?.records.at(0);
      try {
        setIsTransfering(true);
        const receipt = await bridge.transfer(account.address, account.address, deferredAmount.value, {
          relayer: relayInfo?.relayer,
          transferId: relayInfo?.lastTransferId,
          totalFee: fee?.value,
          withdrawNonce: BigInt(relayInfo?.withdrawNonce ?? 0),
          depositedMargin: BigInt(relayInfo?.margin ?? 0),
        });
        notifyTransaction(receipt, sourceChain);
        setTxHash(receipt?.transactionHash);
        if (receipt?.status === "success") {
          setIsTransfering(false);
          refreshBalance();
          refreshAllowance();
        }
      } catch (err) {
        console.error(err);
        notifyError(err);
        setIsTransfering(false);
      }
    }
  }, [
    relayData?.sortedLnBridgeRelayInfos?.records,
    account.address,
    bridge,
    sourceChain,
    fee?.value,
    deferredAmount.value,
    refreshBalance,
    refreshAllowance,
  ]);

  const searchParams = useSearchParams();
  const router = useRouter();

  const changeUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(UrlSearchParamKey.TOKEN_CATEGORY, tokenRef.current.category);
    params.set(UrlSearchParamKey.SOURCE_CHAIN, sourceChainRef.current.network);
    params.set(UrlSearchParamKey.SOURCE_TOKEN, sourceTokenRef.current.symbol);
    params.set(UrlSearchParamKey.TARGET_CHAIN, targetChainRef.current.network);
    params.set(UrlSearchParamKey.TARGET_CHAIN, targetTokenRef.current.symbol);
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const handleTokenChange = useCallback(
    (_token: typeof token) => {
      setToken(_token);
      tokenRef.current = _token;

      const _sourceChainOptions = getSourceChainOptions(_token.category);
      const _sourceChain =
        _sourceChainOptions.find(({ id }) => id === sourceChainRef.current.id) || _sourceChainOptions[0];

      const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, _token.category);
      const _sourceToken =
        _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

      const _targetChainOptions = getTargetChainOptions(_sourceToken);
      const _targetChain =
        _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

      const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setSourceChain(_sourceChain);
      setSourceToken(_sourceToken);
      setTargetChain(_targetChain);
      setTargetToken(_targetToken);

      sourceChainRef.current = _sourceChain;
      sourceTokenRef.current = _sourceToken;
      targetChainRef.current = _targetChain;
      targetTokenRef.current = _targetToken;

      changeUrl();
    },
    [changeUrl],
  );

  const handleSourceChainChange = useCallback(
    (_sourceChain: typeof sourceChain) => {
      setSourceChain(_sourceChain);
      sourceChainRef.current = _sourceChain;

      const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, tokenRef.current.category);
      const _sourceToken =
        _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

      const _targetChainOptions = getTargetChainOptions(_sourceToken);
      const _targetChain =
        _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

      const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setSourceToken(_sourceToken);
      setTargetChain(_targetChain);
      setTargetToken(_targetToken);

      sourceTokenRef.current = _sourceToken;
      targetChainRef.current = _targetChain;
      targetTokenRef.current = _targetToken;

      changeUrl();
    },
    [changeUrl],
  );

  const handleSourceTokenChange = useCallback(
    (_sourceToken: typeof sourceToken) => {
      setSourceToken(_sourceToken);
      sourceTokenRef.current = _sourceToken;

      const _targetChainOptions = getTargetChainOptions(_sourceToken);
      const _targetChain =
        _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

      const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setTargetChain(_targetChain);
      setTargetToken(_targetToken);

      targetChainRef.current = _targetChain;
      targetTokenRef.current = _targetToken;

      changeUrl();
    },
    [changeUrl],
  );

  const handleTargetChainChange = useCallback(
    (_targetChain: typeof targetChain) => {
      setTargetChain(_targetChain);
      targetChainRef.current = _targetChain;

      const _targetTokenOptions = getTargetTokenOptions(sourceTokenRef.current, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setTargetToken(_targetToken);
      targetTokenRef.current = _targetToken;

      changeUrl();
    },
    [changeUrl],
  );

  const handleTargetTokenChange = useCallback(
    (_targetToken: typeof targetToken) => {
      setTargetToken(_targetToken);
      targetTokenRef.current = _targetToken;

      changeUrl();
    },
    [changeUrl],
  );

  const handleSwitch = useCallback(() => {
    const _sourceChain = targetChainRef.current;
    const _targetChain = sourceChainRef.current;

    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, tokenRef.current.category);
    const _sourceToken =
      _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

    setSourceChain(_sourceChain);
    setSourceToken(_sourceToken);
    setTargetChain(_targetChain);
    setTargetToken(_targetToken);

    sourceChainRef.current = _sourceChain;
    sourceTokenRef.current = _sourceToken;
    targetChainRef.current = _targetChain;
    targetTokenRef.current = _targetToken;

    changeUrl();
  }, [changeUrl]);

  return (
    <>
      <div className="mx-auto flex w-full flex-col gap-medium rounded-large bg-[#1F282C] p-medium lg:mt-10 lg:w-[27.5rem] lg:rounded-[1.25rem] lg:p-5">
        <TransferTokenSection token={token} options={tokenOptions} onChange={handleTokenChange} />
        <TransferChainSection
          sourceChain={sourceChain}
          targetChain={targetChain}
          sourceToken={sourceToken}
          targetToken={targetToken}
          disableSwitch={!isSwitchAvailable(sourceChain, targetChain, token.category)}
          sourceChainOptions={getSourceChainOptions(token.category)}
          targetChainOptions={getTargetChainOptions(sourceToken)}
          sourceTokenOptions={getSourceTokenOptions(sourceChain, token.category)}
          targetTokenOptions={getTargetTokenOptions(sourceToken, targetChain)}
          onSourceChainChange={handleSourceChainChange}
          onSourceTokenChange={handleSourceTokenChange}
          onTargetChainChange={handleTargetChainChange}
          onTargetTokenChange={handleTargetTokenChange}
          onSwitch={handleSwitch}
        />
        <TransferAmountSection
          amount={amount}
          loading={loadingBalance}
          balance={balance}
          token={sourceToken}
          min={bridge?.getCrossInfo()?.min}
          onChange={setAmount}
          onRefresh={refreshBalance}
        />
        {deferredAmount.input ? (
          <TransferInformationSection
            bridge={bridge}
            sourceToken={sourceToken}
            relayData={relayData}
            loadingRelayData={loadingRelayData}
            fee={fee}
            loadingFee={loadingFee}
          />
        ) : null}
        <Button
          className="inline-flex h-10 items-center justify-center rounded-[0.625rem]"
          kind="primary"
          busy={isApproving}
          disabled={disableAction}
          onClick={handleAction}
        >
          <span className="text-sm font-bold text-white">{actionText}</span>
        </Button>
      </div>

      <TransferModalV2
        sender={account.address}
        recipient={account.address}
        sourceChain={sourceChain}
        sourceToken={sourceToken}
        targetChain={targetChain}
        targetToken={targetToken}
        txHash={txHash}
        fee={fee}
        bridge={bridge}
        amount={deferredAmount.value}
        busy={isTransfering}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          if (txHash) {
            setAmount({ input: "", valid: true, value: 0n, alert: "" });
          }
          setTxHash(null);
        }}
        onConfirm={handleTransfer}
      />

      <DisclaimerModal />
    </>
  );
}

export default function TransferV2() {
  return (
    <TransferProviderV2>
      <Component />
    </TransferProviderV2>
  );
}
