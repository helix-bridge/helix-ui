import { useRelayer } from "@/hooks";
import { ChainID, InputValue, Lnv20RelayerOverview, Token } from "@/types";
import { notification } from "@/ui/notification";
import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import { formatBalance, formatFeeRate, getChainConfig, notifyError } from "@/utils";
import { useApolloClient } from "@apollo/client";
import dynamic from "next/dynamic";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { Subscription, from } from "rxjs";
import { TransactionReceipt } from "viem";
import { BalanceInput } from "../balance-input";
import FeeRateInput from "../fee-rate-input";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";

type TabKey = "update" | "deposit" | "withdraw";
const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

interface Props {
  relayerInfo?: Lnv20RelayerOverview;
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
    setMargin,
    setBaseFee,
    setFeeRate,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    setBridgeCategory,
    setFeeAndRate,
    depositMargin,
    updateFeeAndMargin,
    withdrawMargin,
    sourceApprove,
    targetApprove,
    isLnBridgeExist,
  } = useRelayer();
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("update");
  const [height, setHeight] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [withdrawFee, setWithdrawFee] = useState<{ value: bigint; token: Token }>();

  const [depositAmount, setDepositAmount] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [withdrawAmount, setWithdrawAmount] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [baseFeeInput, setBaseFeeInput] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [feeRateInput, setFeeRateInput] = useState<InputValue<number>>({ input: "", valid: true, value: 0 });

  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const apolloClient = useApolloClient();

  const { okText, disableOk, switchChainId } = useMemo(() => {
    let okText: "Confirm" | "Approve" | "Switch Network" = "Confirm";
    let switchChainId: ChainID | undefined;
    let disableOk = false;

    if (activeKey === "deposit") {
      if (bridgeCategory === "lnbridgev20-default") {
        if (chain?.id !== targetChain?.id) {
          okText = "Switch Network";
          switchChainId = targetChain?.id;
        } else if (targetToken?.type !== "native" && depositAmount.value > (targetAllowance?.value || 0n)) {
          okText = "Approve";
        }
      } else if (bridgeCategory === "lnbridgev20-opposite") {
        if (chain?.id !== sourceChain?.id) {
          okText = "Switch Network";
          switchChainId = sourceChain?.id;
        } else if (sourceToken?.type !== "native" && depositAmount.value > (sourceAllowance?.value || 0n)) {
          okText = "Approve";
        }
      }

      disableOk = !(depositAmount.input && depositAmount.valid) && okText === "Confirm";
    } else if (chain?.id !== sourceChain?.id) {
      okText = "Switch Network";
      switchChainId = sourceChain?.id;
    }

    if (activeKey === "update") {
      disableOk =
        !(baseFeeInput.input && baseFeeInput.valid && feeRateInput.input && feeRateInput.valid) && okText === "Confirm";
    } else if (activeKey === "withdraw") {
      disableOk = !(withdrawAmount.input && withdrawAmount.valid && withdrawFee?.value) && okText === "Confirm";
    }
    return { okText, disableOk, switchChainId };
  }, [
    chain,
    activeKey,
    withdrawFee,
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
  ]);

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (defaultBridge && relayerInfo?.messageChannel === "layerzero") {
      sub$$ = from(defaultBridge.getWithdrawFee()).subscribe({
        next: setWithdrawFee,
        error: (err) => {
          console.error(err);
          setWithdrawFee(undefined);
        },
      });
    } else {
      setWithdrawFee(undefined);
    }
    return () => sub$$?.unsubscribe();
  }, [defaultBridge, relayerInfo]);

  return (
    <Modal
      title="Manage Relayer"
      className="w-full lg:w-[40rem]"
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
            } else if (okText === "Approve") {
              if (bridgeCategory === "lnbridgev20-default" && defaultBridge) {
                await targetApprove(address, depositAmount.value, defaultBridge, targetChain);
              } else if (bridgeCategory === "lnbridgev20-opposite" && oppositeBridge) {
                await sourceApprove(address, depositAmount.value, oppositeBridge, sourceChain);
              }
            } else if (activeKey === "update") {
              if (bridgeCategory === "lnbridgev20-default" && defaultBridge) {
                receipt = await setFeeAndRate(baseFeeInput.value, feeRateInput.value, defaultBridge, sourceChain);
              } else if (bridgeCategory === "lnbridgev20-opposite" && oppositeBridge) {
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
              if (bridgeCategory === "lnbridgev20-default" && defaultBridge) {
                if (await isLnBridgeExist(apolloClient, sourceChain, targetChain, sourceToken, targetToken)) {
                  receipt = await depositMargin(address, depositAmount.value, defaultBridge, targetChain);
                } else {
                  notification.warn({
                    title: "Deposit failed",
                    description: `The bridge does not exist.`,
                  });
                }
              } else if (bridgeCategory === "lnbridgev20-opposite" && oppositeBridge) {
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
              if (bridgeCategory === "lnbridgev20-default" && defaultBridge) {
                receipt = await withdrawMargin(
                  address,
                  withdrawAmount.value,
                  withdrawFee?.value ?? 0n,
                  defaultBridge,
                  sourceChain,
                );
              } else if (bridgeCategory === "lnbridgev20-opposite" && oppositeBridge) {
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
      disabledOk={disableOk}
      extra={
        activeKey === "withdraw" ? (
          <div className="h-6 self-end">
            <span className="text-sm font-extrabold text-white/50">Powered by LayerZero & Helix</span>
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
            label: (
              <>
                <span className="hidden text-sm font-extrabold lg:inline">Update Fee</span>
                <span className="text-sm font-extrabold lg:hidden">Fee</span>
              </>
            ),
            children: (
              <div className="flex flex-col gap-5" style={{ height: height }}>
                <LabelSection label="Base Fee">
                  <BalanceInput
                    compact
                    token={sourceToken}
                    suffix="symbol"
                    value={baseFeeInput}
                    onChange={setBaseFeeInput}
                  />
                </LabelSection>
                <LabelSection label="Liquidity Fee Rate">
                  <FeeRateInput
                    value={feeRateInput}
                    placeholder={feeRate === undefined ? undefined : `${formatFeeRate(feeRate)}%`}
                    onChange={setFeeRateInput}
                  />
                </LabelSection>
              </div>
            ),
          },
          {
            key: "deposit",
            label: (
              <>
                <span className="hidden text-sm font-extrabold lg:inline">Deposit More Margin</span>
                <span className="text-sm font-extrabold lg:hidden">Margin</span>
              </>
            ),
            children: (
              <LabelSection label="More Margin" height={height}>
                <BalanceInput
                  balance={
                    bridgeCategory === "lnbridgev20-default"
                      ? targetBalance?.value
                      : bridgeCategory === "lnbridgev20-opposite"
                      ? sourceBalance?.value
                      : undefined
                  }
                  token={
                    bridgeCategory === "lnbridgev20-default"
                      ? targetBalance?.token
                      : bridgeCategory === "lnbridgev20-opposite"
                      ? sourceBalance?.token
                      : undefined
                  }
                  compact
                  suffix="symbol"
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
                <span className="hidden text-sm font-extrabold lg:inline">Withdraw Margin</span>
                <span className="text-sm font-extrabold lg:hidden">Withdraw</span>
                <Tooltip
                  content="A cross-chain message is required to perform a `withdraw margin` operation"
                  contentClassName="w-60"
                  className="w-fit"
                >
                  <Image width={16} height={16} alt="Info" src="/images/info.svg" />
                </Tooltip>
              </div>
            ),
            children: (
              <div className="flex flex-col gap-5" ref={(node) => setHeight((prev) => node?.clientHeight || prev)}>
                <LabelSection label="Withdraw Amount">
                  <BalanceInput
                    balance={margin}
                    token={sourceToken}
                    compact
                    suffix="symbol"
                    value={withdrawAmount}
                    onChange={setWithdrawAmount}
                  />
                </LabelSection>
                <LabelSection label="Withdraw Fee" tips="This value is calculated and does not require input">
                  <div
                    className={`bg-inner lg:px-middle px-small rounded-middle relative flex h-10 items-center justify-between border ${
                      withdrawFee ? "border-transparent" : "border-app-red"
                    }`}
                  >
                    {withdrawFee ? (
                      <>
                        <span className="text-sm font-medium text-white">
                          {formatBalance(withdrawFee.value, withdrawFee.token.decimals, { precision: 6 })}
                        </span>
                        <span className="text-sm font-medium text-white">{withdrawFee.token.symbol}</span>
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
            disabled: relayerInfo?.messageChannel !== "layerzero",
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
    <div className="gap-middle flex flex-col" style={{ height }}>
      <div className="gap-small flex items-center">
        <span className="text-sm font-extrabold">{label}</span>
        {tips ? (
          <Tooltip content={tips}>
            <Image width={16} height={16} alt="Info" src="/images/info.svg" />
          </Tooltip>
        ) : null}
      </div>
      {children}
    </div>
  );
}
