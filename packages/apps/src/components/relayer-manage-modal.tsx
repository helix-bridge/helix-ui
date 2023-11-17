import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { BalanceInput } from "./balance-input";
import FeeRateInput from "./fee-rate-input";
import { LnRelayerInfo } from "@/types/graphql";
import { getChainConfig } from "@/utils/chain";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { formatBalance } from "@/utils/balance";
import { useRelayer } from "@/hooks/use-relayer";
import dynamic from "next/dynamic";
import { formatFeeRate, isValidFeeRate } from "@/utils/misc";
import { TransactionReceipt } from "viem";
import { Token } from "@/types/token";
import { Subscription, from } from "rxjs";

type TabKey = "update" | "deposit" | "withdraw";
const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

interface Props {
  relayerInfo?: LnRelayerInfo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RelayerManageModal({ relayerInfo, isOpen, onClose, onSuccess }: Props) {
  const {
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
    defaultBridge,
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
  } = useRelayer();
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("update");
  const [height, setHeight] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [depositAmount, setDepositAmount] = useState<{ formatted: bigint; value: string }>({
    formatted: 0n,
    value: "",
  });
  const [withdrawAmount, setWithdrawAmount] = useState<{ formatted: bigint; value: string }>({
    formatted: 0n,
    value: "",
  });
  const [withdrawFee, setWithdrawFee] = useState<{ fee: bigint; token: Token }>();

  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    const _category = relayerInfo?.bridge;
    const _sourceChain = getChainConfig(relayerInfo?.fromChain);
    const _targetChain = getChainConfig(relayerInfo?.toChain);
    const _sourceToken = _sourceChain?.tokens.find(
      (t) => t.address.toLowerCase() === relayerInfo?.sendToken?.toLowerCase(),
    );
    const _cross = _sourceToken?.cross.find(
      (c) => c.bridge.category === _category && c.target.network === _targetChain?.network,
    );
    const _targetToken = getChainConfig(_cross?.target.network)?.tokens.find((t) => t.symbol === _cross?.target.symbol);

    if (relayerInfo?.baseFee && _sourceToken) {
      setBaseFee({
        formatted: BigInt(relayerInfo.baseFee),
        value: formatBalance(BigInt(relayerInfo.baseFee), _sourceToken.decimals),
      });
    }

    if (relayerInfo?.liquidityFeeRate) {
      setFeeRate({
        formatted: Number(relayerInfo.liquidityFeeRate),
        value: `${formatFeeRate(relayerInfo.liquidityFeeRate)}`,
      });
    }

    if (relayerInfo?.bridge === "lnbridgev20-default" && _targetToken && relayerInfo.margin) {
      setMargin({
        formatted: BigInt(relayerInfo.margin),
        value: formatBalance(BigInt(relayerInfo.margin), _targetToken.decimals),
      });
    } else if (relayerInfo?.bridge === "lnbridgev20-opposite" && _sourceToken && relayerInfo.margin) {
      setMargin({
        formatted: BigInt(relayerInfo.margin),
        value: formatBalance(BigInt(relayerInfo.margin), _sourceToken.decimals),
      });
    }

    setBridgeCategory(_category);
    setSourceChain(_sourceChain);
    setTargetChain(_targetChain);
    setSourceToken(_sourceToken);
    setWithdrawAmount({ formatted: 0n, value: "" });
    setDepositAmount({ formatted: 0n, value: "" });
    setActiveKey("update");
  }, [
    relayerInfo,
    setBaseFee,
    setFeeRate,
    setMargin,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    setBridgeCategory,
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

  const okText = useMemo(() => {
    let text = "Confirm";
    if (activeKey === "deposit") {
      if (bridgeCategory === "lnbridgev20-default") {
        if (chain?.id !== targetChain?.id) {
          text = "Switch Network";
        } else if (targetToken?.type !== "native" && depositAmount.formatted > (targetAllowance?.value || 0n)) {
          text = "Approve";
        }
      } else if (bridgeCategory === "lnbridgev20-opposite") {
        if (chain?.id !== sourceChain?.id) {
          text = "Switch Network";
        } else if (sourceToken?.type !== "native" && depositAmount.formatted > (sourceAllowance?.value || 0n)) {
          text = "Approve";
        }
      }
    } else if (chain?.id !== sourceChain?.id) {
      text = "Switch Network";
    }
    return text;
  }, [
    chain,
    depositAmount,
    activeKey,
    bridgeCategory,
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    sourceAllowance,
    targetAllowance,
  ]);

  return (
    <Modal
      title="Manage Relayer"
      className="w-full lg:w-[40rem]"
      okText={okText}
      isOpen={isOpen}
      onClose={onClose}
      onOk={async () => {
        let receipt: TransactionReceipt | undefined;
        try {
          if (activeKey === "update") {
            if (chain?.id !== sourceChain?.id) {
              switchNetwork?.(sourceChain?.id);
            } else if (bridgeCategory === "lnbridgev20-default") {
              setBusy(true);
              receipt = await setFeeAndRate(baseFee.formatted, feeRate.formatted);
            } else if (bridgeCategory === "lnbridgev20-opposite") {
              setBusy(true);
              receipt = await updateFeeAndMargin(margin.formatted, baseFee.formatted, feeRate.formatted);
            }
          } else if (activeKey === "deposit") {
            if (bridgeCategory === "lnbridgev20-default") {
              if (chain?.id !== targetChain?.id) {
                switchNetwork?.(targetChain?.id);
              } else if (targetToken?.type !== "native" && depositAmount.formatted > (targetAllowance?.value || 0n)) {
                setBusy(true);
                await targetApprove(depositAmount.formatted);
              } else {
                setBusy(true);
                receipt = await depositMargin(depositAmount.formatted);
              }
            } else if (bridgeCategory === "lnbridgev20-opposite") {
              if (chain?.id !== sourceChain?.id) {
                switchNetwork?.(sourceChain?.id);
              } else if (sourceToken?.type !== "native" && depositAmount.formatted > (sourceAllowance?.value || 0n)) {
                setBusy(true);
                await sourceApprove(depositAmount.formatted);
              } else {
                setBusy(true);
                receipt = await updateFeeAndMargin(depositAmount.formatted, baseFee.formatted, feeRate.formatted);
              }
            }
          } else if (activeKey === "withdraw") {
            if (chain?.id !== sourceChain?.id) {
              switchNetwork?.(sourceChain?.id);
            } else {
              setBusy(true);
              receipt = await withdrawMargin(withdrawAmount.formatted, withdrawFee?.fee ?? 0n);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setBusy(false);
          if (receipt?.status === "success") {
            onSuccess();
            onClose();
          }
        }
      }}
      busy={busy}
      disabledCancel={busy}
      disabledOk={
        activeKey === "update" && !(baseFee.value && feeRate.value && isValidFeeRate(feeRate.formatted))
          ? true
          : activeKey === "deposit" && depositAmount.formatted === 0n
          ? true
          : activeKey === "withdraw" && (withdrawAmount.formatted === 0n || !withdrawFee)
          ? true
          : false
      }
      extra={
        activeKey === "withdraw" ? (
          <div className="h-6 self-end">
            <span className="text-sm text-white/50">Powered by LayerZero & Helix</span>
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
                <span className="hidden text-sm font-medium lg:inline">Update Fee</span>
                <span className="text-sm font-medium lg:hidden">Fee</span>
              </>
            ),
            children: (
              <div className="flex flex-col gap-5" style={{ height: height }}>
                <LabelSection label="Base Fee">
                  <BalanceInput token={sourceToken} suffix="symbol" value={baseFee} onChange={setBaseFee} />
                </LabelSection>
                <LabelSection label="Liquidity Fee Rate">
                  <FeeRateInput value={feeRate} onChange={setFeeRate} />
                </LabelSection>
              </div>
            ),
          },
          {
            key: "deposit",
            label: (
              <>
                <span className="hidden text-sm font-medium lg:inline">Deposit More Margin</span>
                <span className="text-sm font-medium lg:hidden">Margin</span>
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
                <span className="hidden text-sm font-medium lg:inline">Withdraw Margin</span>
                <span className="text-sm font-medium lg:hidden">Withdraw</span>
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
                    balance={margin.formatted}
                    token={sourceToken}
                    suffix="symbol"
                    value={withdrawAmount}
                    onChange={setWithdrawAmount}
                  />
                </LabelSection>
                <LabelSection label="Withdraw Fee">
                  <div
                    className={`bg-app-bg lg:px-middle px-small relative flex h-10 items-center justify-between rounded border ${
                      withdrawFee ? "border-transparent" : "border-app-red"
                    }`}
                  >
                    {withdrawFee ? (
                      <>
                        <span>{formatBalance(withdrawFee.fee, withdrawFee.token.decimals, { precision: 6 })}</span>
                        <span>{withdrawFee.token.symbol}</span>
                      </>
                    ) : (
                      <span className="text-app-red absolute -bottom-5 left-0 text-xs">
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

function LabelSection({ label, children, height }: PropsWithChildren<{ label: string; height?: number }>) {
  return (
    <div className="gap-middle flex flex-col" style={{ height }}>
      <span className="text-sm font-normal">{label}</span>
      {children}
    </div>
  );
}
