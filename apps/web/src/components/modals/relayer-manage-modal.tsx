import { useRelayer } from "../../hooks";
import { ChainID, InputValue, LnBridgeRelayerOverview, Token } from "../../types";
import { notification } from "../../ui/notification";
import SegmentedTabs from "../../ui/segmented-tabs";
import { formatBalance, formatFeeRate, getChainConfig, notifyError } from "../../utils";
import { useApolloClient } from "@apollo/client";
import { PropsWithChildren, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Subscription, from } from "rxjs";
import { Hex, TransactionReceipt } from "viem";
import { BalanceInput } from "../balance-input";
import FeeRateInput from "../fee-rate-input";
import Tooltip from "../../ui/tooltip";
import CountLoading from "../../ui/count-loading";
import Modal from "../../ui/modal";

type TabKey = "update" | "deposit" | "withdraw" | "allowance";

interface Props {
  relayerInfo?: LnBridgeRelayerOverview;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RelayerManageModal({ relayerInfo, isOpen, onClose, onSuccess }: Props) {
  const {
    defaultBridge,
    oppositeBridge,
    bridgeCategory,
    sourceAllowance,
    targetAllowance,
    sourceBalance,
    targetBalance,
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    margin,
    baseFee,
    feeRate,
    withdrawAmount,
    setMargin,
    setBaseFee,
    setFeeRate,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    setBridgeCategory,
    setFeeAndRate,
    setWithdrawAmount,
    depositMargin,
    updateFeeAndMargin,
    withdrawMargin,
    sourceApprove,
    targetApprove,
    isLnBridgeExist,
  } = useRelayer();
  const [activeKey, setActiveKey] = useState<TabKey>("update");
  const [height, setHeight] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [loadingWithdrawFee, setLoadingWithdrawFee] = useState(false);
  const [withdrawFeeParams, setWithdrawFeeParams] = useState<{
    value: bigint;
    token: Token;
    params: Hex | undefined;
  }>();
  const [allowanceInput, setAllowanceInput] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [depositAmount, setDepositAmount] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [baseFeeInput, setBaseFeeInput] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [feeRateInput, setFeeRateInput] = useState<InputValue<number>>({ input: "", valid: true, value: 0 });
  const deferredWithdrawAmount = useDeferredValue(withdrawAmount);

  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const apolloClient = useApolloClient();

  const { okText, disableOk, switchChainId } = useMemo(() => {
    let okText: "Confirm" | "Approve" | "Switch Network" = "Confirm";
    let switchChainId: ChainID | undefined;
    let disableOk = false;

    if (activeKey === "allowance") {
      if (chain?.id !== targetChain?.id) {
        okText = "Switch Network";
        switchChainId = targetChain?.id;
      } else if (!allowanceInput.input || !allowanceInput.valid) {
        disableOk = true;
      } else {
        okText = "Approve";
      }
    } else if (activeKey === "deposit") {
      if (bridgeCategory === "lnv2-default") {
        if (chain?.id !== targetChain?.id) {
          okText = "Switch Network";
          switchChainId = targetChain?.id;
        } else if (targetToken?.type !== "native" && depositAmount.value > (targetAllowance?.value || 0n)) {
          okText = "Approve";
        }
      } else if (bridgeCategory === "lnv2-opposite") {
        if (chain?.id !== sourceChain?.id) {
          okText = "Switch Network";
          switchChainId = sourceChain?.id;
        } else if (sourceToken?.type !== "native" && depositAmount.value > (sourceAllowance?.value || 0n)) {
          okText = "Approve";
        }
      }

      disableOk = !(depositAmount.value && depositAmount.valid) && okText === "Confirm";
    } else if (chain?.id !== sourceChain?.id) {
      okText = "Switch Network";
      switchChainId = sourceChain?.id;
    }

    if (activeKey === "update") {
      disableOk =
        !(baseFeeInput.input && baseFeeInput.valid && feeRateInput.input && feeRateInput.valid) && okText === "Confirm";
    } else if (activeKey === "withdraw") {
      disableOk = !(withdrawAmount.value && withdrawAmount.valid && withdrawFeeParams?.value) && okText === "Confirm";
    }
    return { okText, disableOk, switchChainId };
  }, [
    chain,
    activeKey,
    withdrawFeeParams,
    baseFeeInput,
    feeRateInput,
    depositAmount,
    withdrawAmount,
    bridgeCategory,
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    sourceAllowance,
    targetAllowance,
    allowanceInput,
  ]);

  useEffect(() => {
    const _category = relayerInfo?.bridge;
    const _sourceChain = getChainConfig(relayerInfo?.fromChain);
    const _targetChain = getChainConfig(relayerInfo?.toChain);
    const _sourceToken = _sourceChain?.tokens.find(
      (t) => t.address.toLowerCase() === relayerInfo?.sendToken?.toLowerCase(),
    );

    if (relayerInfo?.baseFee) {
      setBaseFee(BigInt(relayerInfo.baseFee));
    }
    if (relayerInfo?.liquidityFeeRate) {
      setFeeRate(Number(relayerInfo.liquidityFeeRate));
    }
    if (relayerInfo?.margin) {
      setMargin(BigInt(relayerInfo.margin));
    }
    setBridgeCategory(_category);
    setSourceChain(_sourceChain);
    setTargetChain(_targetChain);
    setSourceToken(_sourceToken);
    setAllowanceInput({ input: "", valid: true, value: 0n });
    setDepositAmount({ input: "", valid: true, value: 0n });
    setWithdrawAmount({ input: "", valid: true, value: 0n });
    setBaseFeeInput({ input: "", valid: true, value: 0n });
    setFeeRateInput({ input: "", valid: true, value: 0 });
    setActiveKey("update");
  }, [
    relayerInfo,
    setBaseFee,
    setFeeRate,
    setMargin,
    setBridgeCategory,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    setWithdrawAmount,
  ]);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (
      activeKey === "withdraw" &&
      (defaultBridge || oppositeBridge) &&
      (relayerInfo?.messageChannel === "layerzero" || relayerInfo?.messageChannel === "msgline")
    ) {
      setLoadingWithdrawFee(true);
      const args = {
        amount: deferredWithdrawAmount.value,
        sender: address,
        relayer: relayerInfo.relayer,
        transferId: relayerInfo.lastTransferId,
        withdrawNonce: relayerInfo.withdrawNonce,
        messageChannel: relayerInfo.messageChannel,
      } as const;
      sub$$ = from(
        defaultBridge
          ? defaultBridge.getWithdrawFeeParams(args)
          : oppositeBridge
            ? oppositeBridge.getWithdrawFeeParams(args)
            : Promise.resolve(undefined),
      ).subscribe({
        next: setWithdrawFeeParams,
        error: (err) => {
          console.error(err);
          setWithdrawFeeParams(undefined);
          setLoadingWithdrawFee(false);
        },
        complete: () => setLoadingWithdrawFee(false),
      });
    } else {
      setWithdrawFeeParams(undefined);
    }
    return () => sub$$?.unsubscribe();
  }, [defaultBridge, oppositeBridge, relayerInfo, address, activeKey, deferredWithdrawAmount]);

  return (
    <Modal
      title="Manage Relayer"
      className="w-full lg:w-[32rem]"
      okText={okText}
      isOpen={isOpen}
      onClose={onClose}
      onOk={async () => {
        let receipt: TransactionReceipt | undefined;
        if (address && sourceChain && targetChain && sourceToken && targetToken) {
          setBusy(true);

          try {
            if (okText === "Switch Network") {
              switchNetwork?.(switchChainId);
            } else if (activeKey === "allowance") {
              if (bridgeCategory === "lnv2-default" && defaultBridge) {
                receipt = await targetApprove(address, allowanceInput.value, defaultBridge, targetChain);
              } else if (bridgeCategory === "lnv2-opposite" && oppositeBridge) {
                receipt = await targetApprove(address, allowanceInput.value, oppositeBridge, targetChain);
              }
            } else if (okText === "Approve") {
              if (bridgeCategory === "lnv2-default" && defaultBridge) {
                await targetApprove(address, depositAmount.value, defaultBridge, targetChain);
              } else if (bridgeCategory === "lnv2-opposite" && oppositeBridge) {
                await sourceApprove(address, depositAmount.value, oppositeBridge, sourceChain);
              }
            } else if (activeKey === "update") {
              if (bridgeCategory === "lnv2-default" && defaultBridge) {
                receipt = await setFeeAndRate(baseFeeInput.value, feeRateInput.value, defaultBridge, sourceChain);
              } else if (bridgeCategory === "lnv2-opposite" && oppositeBridge) {
                receipt = await updateFeeAndMargin(
                  address,
                  margin ?? 0n,
                  baseFeeInput.value,
                  feeRateInput.value,
                  oppositeBridge,
                  sourceChain,
                );
              }
            } else if (activeKey === "deposit") {
              if (bridgeCategory === "lnv2-default" && defaultBridge) {
                if (await isLnBridgeExist(apolloClient, sourceChain, targetChain, sourceToken, targetToken)) {
                  receipt = await depositMargin(address, depositAmount.value, defaultBridge, targetChain);
                } else {
                  notification.warn({
                    title: "Deposit failed",
                    description: `The bridge does not exist.`,
                  });
                }
              } else if (bridgeCategory === "lnv2-opposite" && oppositeBridge) {
                if (await isLnBridgeExist(apolloClient, sourceChain, targetChain, sourceToken, targetToken)) {
                  receipt = await updateFeeAndMargin(
                    address,
                    depositAmount.value,
                    baseFee ?? 0n,
                    feeRate ?? 0,
                    oppositeBridge,
                    sourceChain,
                  );
                } else {
                  notification.warn({
                    title: "Deposit failed",
                    description: `The bridge does not exist.`,
                  });
                }
              }
            } else if (activeKey === "withdraw") {
              if (bridgeCategory === "lnv2-default" && defaultBridge) {
                receipt = await withdrawMargin(
                  withdrawFeeParams?.params ?? address,
                  withdrawAmount.value,
                  withdrawFeeParams?.value ?? 0n,
                  defaultBridge,
                  sourceChain,
                );
              } else if (bridgeCategory === "lnv2-opposite" && oppositeBridge) {
                //
              }
            }
          } catch (err) {
            console.error(err);
            notifyError(err);
          } finally {
            setBusy(false);
            if (receipt?.status === "success") {
              onSuccess();
              onClose();
            }
          }
        }
      }}
      busy={busy}
      disabledCancel={busy}
      disabledOk={disableOk || (activeKey === "withdraw" && okText === "Confirm" && loadingWithdrawFee)}
      extra={
        activeKey === "withdraw" ? (
          <div className="h-6 self-end">
            <span className="text-sm font-medium text-white/50">
              {relayerInfo?.messageChannel === "layerzero"
                ? "Powered by LayerZero & Helix"
                : "Powered by Msgport & Helix"}
            </span>
          </div>
        ) : (
          <div className="h-6" />
        )
      }
      onCancel={onClose}
    >
      <SegmentedTabs
        options={[
          {
            key: "update",
            label: <span className="text-sm font-bold">Update</span>,
            children: (
              <div className="flex flex-col gap-5" style={{ height: height }}>
                <LabelSection label="Base Fee">
                  <BalanceInput token={sourceToken} value={baseFeeInput} onChange={setBaseFeeInput} />
                </LabelSection>
                <LabelSection label="Liquidity Fee Rate">
                  <FeeRateInput
                    value={feeRateInput}
                    className="bg-app-bg px-medium h-10 rounded-xl text-sm font-semibold text-white lg:h-11"
                    placeholder={feeRate === undefined ? undefined : `${formatFeeRate(feeRate)}%`}
                    onChange={setFeeRateInput}
                  />
                </LabelSection>
              </div>
            ),
          },
          {
            key: "deposit",
            label: <span className="text-sm font-bold">Deposit</span>,
            children: (
              <LabelSection label="More Margin" height={height}>
                <BalanceInput
                  balance={
                    bridgeCategory === "lnv2-default"
                      ? targetBalance?.value
                      : bridgeCategory === "lnv2-opposite"
                        ? sourceBalance?.value
                        : undefined
                  }
                  token={
                    bridgeCategory === "lnv2-default"
                      ? targetBalance?.token
                      : bridgeCategory === "lnv2-opposite"
                        ? sourceBalance?.token
                        : undefined
                  }
                  value={depositAmount}
                  onChange={setDepositAmount}
                />
              </LabelSection>
            ),
          },
          {
            key: "withdraw",
            label: (
              <div className="gap-small flex items-center justify-center">
                <span className="text-sm font-bold">Withdraw</span>
                <Tooltip
                  content="A cross-chain message is required to perform a `withdraw margin` operation"
                  contentClassName="w-72"
                  className="w-fit"
                >
                  <img width={16} height={16} alt="Info" src="images/info.svg" />
                </Tooltip>
              </div>
            ),
            children: (
              <div className="flex flex-col gap-5" ref={(node) => setHeight((prev) => node?.clientHeight || prev)}>
                <LabelSection label="Withdraw Amount">
                  <BalanceInput
                    balance={margin}
                    token={sourceToken}
                    value={withdrawAmount}
                    onChange={setWithdrawAmount}
                  />
                </LabelSection>
                <LabelSection label="Withdraw Fee" tips="This value is calculated and does not require input">
                  <div
                    className={`bg-app-bg px-medium relative flex h-10 items-center justify-between rounded-xl border lg:h-11 ${
                      withdrawFeeParams || loadingWithdrawFee ? "border-transparent" : "border-app-red"
                    }`}
                  >
                    {loadingWithdrawFee ? (
                      <CountLoading size="small" color="white" />
                    ) : withdrawFeeParams ? (
                      <>
                        <span className="text-sm font-semibold text-white">
                          {formatBalance(withdrawFeeParams.value, withdrawFeeParams.token.decimals, { precision: 6 })}
                        </span>
                        <span className="text-sm font-semibold text-white">{withdrawFeeParams.token.symbol}</span>
                      </>
                    ) : (
                      <span className="text-app-red absolute -bottom-5 left-0 text-xs font-medium">
                        * Failed to get fee, withdraw is temporarily unavailable
                      </span>
                    )}
                  </div>
                </LabelSection>
              </div>
            ),
            disabled: !(relayerInfo?.messageChannel === "layerzero" || relayerInfo?.messageChannel === "msgline"),
          },
          {
            key: "allowance",
            label: <span className="text-sm font-bold">Allowance</span>,
            children: (
              <div className="flex flex-col gap-5">
                <LabelSection label="Approve More" height={height}>
                  <BalanceInput
                    balance={targetBalance?.value}
                    token={targetBalance?.token}
                    value={allowanceInput}
                    onChange={setAllowanceInput}
                  />
                </LabelSection>
              </div>
            ),
            hidden: targetToken?.type === "native",
          },
        ]}
        activeKey={activeKey}
        onChange={setActiveKey}
      />
    </Modal>
  );
}

function LabelSection({
  label,
  children,
  height,
  tips,
}: PropsWithChildren<{ label: string; height?: number; tips?: string }>) {
  return (
    <div className="gap-medium flex flex-col" style={{ height }}>
      <div className="gap-small flex items-center">
        <span className="text-sm font-semibold text-white/50">{label}</span>
        {tips ? (
          <Tooltip content={tips}>
            <img width={16} height={16} alt="Info" src="images/info.svg" />
          </Tooltip>
        ) : null}
      </div>
      {children}
    </div>
  );
}
