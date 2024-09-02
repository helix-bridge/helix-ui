import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import TransferTokenSection from "./transfer-token-section";
import { bridgeFactory, getSourceTokenOptions, getTargetTokenOptions, notifyError, notifyTransaction } from "../utils";
import TransferChainSection from "./transfer-chain-section";
import TransferAmountSection from "./transfer-amount-section";
import TransferInformationSection from "./transfer-information-section";
import Button from "../ui/button";
import {
  useAllowance,
  useApp,
  useBalance,
  useMaxTransfer,
  useSortedRelayData,
  useTransactionFee,
  useTransfer,
} from "../hooks";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import TransferProvider from "../providers/transfer-provider";
import DisclaimerModal from "./modals/disclaimer-modal";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Address } from "viem";
import TransferModal from "./modals/transfer-modal";

interface Recipient {
  input: string;
  value: Address | undefined;
  alert?: string;
}

function Component() {
  const { updateBalanceAll, setIsHistoryOpen, setHistoryDetails } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransfering, setIsTransfering] = useState(false);
  const {
    amount,
    token,
    sourceChain,
    sourceToken,
    targetChain,
    targetToken,
    sourceChainOptions,
    targetChainOptions,
    availableTokenOptions,
    loadingSupportedChains,
    loadingAvailableTokenOptions,
    setAmount,
    isSwitchAvailable,
    handleTokenChange,
    handleSourceChainChange,
    handleSourceTokenChange,
    handleTargetChainChange,
    handleTargetTokenChange,
    handleSwitch,
  } = useTransfer();
  const deferredAmount = useDeferredValue(amount);

  const account = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const [recipient, setRecipient] = useState<Recipient>({
    input: account.address ?? "",
    value: account.address,
    alert: undefined,
  });
  const [expandRecipient, setExpandRecipient] = useState(false);
  const isCustomRecipient = useRef(false); // After input recipient manually, set to `true`
  useEffect(() => {
    if (!isCustomRecipient.current) {
      if (account.address) {
        setRecipient({ input: account.address, value: account.address, alert: undefined });
      } else {
        setRecipient({ input: "", value: undefined, alert: undefined });
      }
    }
  }, [account.address]);
  const handleRecipientChange = useCallback((value: Recipient) => {
    setRecipient(value);
    isCustomRecipient.current = true;
  }, []);
  const handleExpandRecipient = useCallback(() => setExpandRecipient((prev) => !prev), []);

  const {
    balance,
    loading: loadingBalance,
    refresh: refreshBalance,
  } = useBalance(sourceChain, sourceToken, account.address);
  const { maxTransfer } = useMaxTransfer(sourceChain, targetChain, sourceToken, balance);

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
        disabled =
          loadingAllowance ||
          fee?.value === undefined ||
          !deferredAmount.input ||
          !deferredAmount.valid ||
          !recipient.value ||
          !!recipient.alert;
      }
    } else {
      text = "Connect Wallet";
      disabled = false;
    }

    return [text, disabled];
  }, [
    allowance,
    loadingAllowance,
    chain?.id,
    deferredAmount,
    sourceChain.id,
    fee?.value,
    fee?.token.type,
    recipient.alert,
    recipient.value,
  ]);

  const handleAction = useCallback(async () => {
    if (actionText === "Connect Wallet") {
      openConnectModal?.();
    } else if (actionText === "Switch Chain") {
      switchNetwork?.(sourceChain.id);
    } else if (actionText === "Approve") {
      const receipt = await approve(
        fee?.token.type === "native" ? deferredAmount.value : deferredAmount.value + (fee?.value ?? 0n),
      );
      notifyTransaction(receipt, sourceChain, "Approval");
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
    const sourceChain = bridge?.getSourceChain();
    const targetChain = bridge?.getTargetChain();

    if (bridge && account.address && recipient.value) {
      const relayInfo = relayData?.sortedLnBridgeRelayInfos?.records.at(0);
      try {
        setIsTransfering(true);
        const receipt = await bridge.transfer(account.address, recipient.value, deferredAmount.value, {
          relayer: relayInfo?.relayer,
          transferId: relayInfo?.lastTransferId,
          totalFee: fee?.value,
          withdrawNonce: BigInt(relayInfo?.withdrawNonce ?? 0),
          depositedMargin: BigInt(relayInfo?.margin ?? 0),
        });
        notifyTransaction(receipt, sourceChain, "Transfer");
        setIsTransfering(false);
        if (receipt?.status === "success") {
          setAmount({ input: "", valid: true, value: 0n, alert: "" });
          setHistoryDetails({
            requestTxHash: receipt.transactionHash,
            fromChain: sourceChain?.network,
            toChain: targetChain?.network,
            sendToken: bridge.getSourceToken()?.symbol,
            sendAmount: deferredAmount.value.toString(),
          });
          setIsOpen(false);
          setIsHistoryOpen(true);
          refreshBalance();
          refreshAllowance();
          updateBalanceAll();
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
    recipient.value,
    bridge,
    fee?.value,
    deferredAmount.value,
    setAmount,
    refreshBalance,
    refreshAllowance,
    updateBalanceAll,
    setIsHistoryOpen,
    setHistoryDetails,
  ]);

  return (
    <>
      <div className="gap-medium p-medium flex w-full flex-col rounded-2xl bg-[#1F282C] lg:w-[27.5rem] lg:gap-5 lg:rounded-[2rem] lg:p-5">
        <TransferTokenSection
          token={token}
          options={availableTokenOptions}
          loading={loadingAvailableTokenOptions}
          onChange={handleTokenChange}
        />
        <TransferChainSection
          recipient={recipient}
          loading={loadingSupportedChains}
          expandRecipient={expandRecipient}
          recipientOptions={account.address ? [account.address] : []}
          sourceChain={sourceChain}
          targetChain={targetChain}
          sourceToken={sourceToken}
          targetToken={targetToken}
          sourceChainOptions={sourceChainOptions}
          targetChainOptions={targetChainOptions}
          disableSwitch={!isSwitchAvailable(sourceChain, targetChain)}
          sourceTokenOptions={getSourceTokenOptions(sourceChain, token.category)}
          targetTokenOptions={getTargetTokenOptions(sourceToken, targetChain)}
          onSourceChainChange={handleSourceChainChange}
          onSourceTokenChange={handleSourceTokenChange}
          onTargetChainChange={handleTargetChainChange}
          onTargetTokenChange={handleTargetTokenChange}
          onSwitch={handleSwitch}
          onRecipientChange={handleRecipientChange}
          onExpandRecipient={handleExpandRecipient}
        />
        <TransferAmountSection
          amount={amount}
          loading={loadingBalance}
          balance={balance}
          sourceToken={sourceToken}
          targetToken={targetToken}
          chain={sourceChain}
          max={maxTransfer}
          onChange={setAmount}
          onRefresh={refreshBalance}
        />
        <TransferInformationSection
          bridge={bridge}
          sourceToken={sourceToken}
          relayData={relayData}
          loadingRelayData={loadingRelayData}
          fee={fee}
          loadingFee={loadingFee}
        />
        <Button
          className={`inline-flex h-12 items-center justify-center rounded-full`}
          kind="primary"
          busy={isApproving}
          disabled={disableAction || !sourceChainOptions.length}
          onClick={handleAction}
        >
          <span className="text-base font-bold text-white">{actionText}</span>
        </Button>
      </div>

      <TransferModal
        sender={account.address}
        recipient={recipient.value}
        sourceChain={sourceChain}
        sourceToken={sourceToken}
        targetChain={targetChain}
        targetToken={targetToken}
        fee={fee}
        bridge={bridge}
        amount={deferredAmount}
        busy={isTransfering}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleTransfer}
      />

      <DisclaimerModal />
    </>
  );
}

export default function Transfer() {
  return (
    <TransferProvider>
      <Component />
    </TransferProvider>
  );
}
