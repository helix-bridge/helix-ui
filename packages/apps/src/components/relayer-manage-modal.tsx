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
    sourceApprove,
    targetApprove,
  } = useRelayer();
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("update");
  const [height, setHeight] = useState<number>();
  const [busy, setBusy] = useState(false);

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

  const okText = useMemo(() => {
    let text = "Confirm";
    if (activeKey === "deposit") {
      if (bridgeCategory === "lnbridgev20-default") {
        if (chain?.id !== targetChain?.id) {
          text = "Switch Network";
        } else if (sourceToken?.type !== "native" && margin.formatted > (targetAllowance?.value || 0n)) {
          text = "Approve";
        }
      } else if (bridgeCategory === "lnbridgev20-opposite") {
        if (chain?.id !== sourceChain?.id) {
          text = "Switch Network";
        } else if (sourceToken?.type !== "native" && margin.formatted > (sourceAllowance?.value || 0n)) {
          text = "Approve";
        }
      }
    } else if (chain?.id !== sourceChain?.id) {
      text = "Switch Network";
    }
    return text;
  }, [
    chain,
    margin,
    activeKey,
    bridgeCategory,
    sourceChain,
    targetChain,
    sourceToken,
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
        try {
          if (activeKey === "update") {
            if (chain?.id !== sourceChain?.id) {
              switchNetwork?.(sourceChain?.id);
            } else if (bridgeCategory === "lnbridgev20-default") {
              setBusy(true);
              const receipt = await setFeeAndRate(baseFee.formatted, feeRate.formatted);
              if (receipt?.status === "success") {
                onSuccess();
                onClose();
              }
            } else if (bridgeCategory === "lnbridgev20-opposite") {
              setBusy(true);
              const receipt = await updateFeeAndMargin(margin.formatted, baseFee.formatted, feeRate.formatted);
              if (receipt?.status === "success") {
                onSuccess();
                onClose();
              }
            }
          } else if (activeKey === "deposit") {
            if (bridgeCategory === "lnbridgev20-default") {
              if (chain?.id !== targetChain?.id) {
                switchNetwork?.(targetChain?.id);
              } else if (sourceToken?.type !== "native" && margin.formatted > (targetAllowance?.value || 0n)) {
                setBusy(true);
                await targetApprove(margin.formatted);
              } else {
                setBusy(true);
                const receipt = await depositMargin(margin.formatted);
                if (receipt?.status === "success") {
                  onSuccess();
                  onClose();
                }
              }
            } else if (bridgeCategory === "lnbridgev20-opposite") {
              if (chain?.id !== sourceChain?.id) {
                switchNetwork?.(sourceChain?.id);
              } else if (sourceToken?.type !== "native" && margin.formatted > (sourceAllowance?.value || 0n)) {
                setBusy(true);
                await sourceApprove(margin.formatted);
              } else {
                setBusy(true);
                const receipt = await updateFeeAndMargin(margin.formatted, baseFee.formatted, feeRate.formatted);
                if (receipt?.status === "success") {
                  onSuccess();
                  onClose();
                }
              }
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setBusy(false);
        }
      }}
      busy={busy}
      disabledCancel={busy}
      disabledOk={
        activeKey === "update" && !(baseFee.value && feeRate.value && isValidFeeRate(feeRate.formatted))
          ? true
          : activeKey === "deposit" && margin.formatted === 0n
          ? true
          : false
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
              <div className="flex flex-col gap-5" ref={(node) => setHeight((prev) => node?.clientHeight || prev)}>
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
                  onChange={setMargin}
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
                  content={
                    <span className="text-xs font-normal text-white">
                      A cross-chain message is required to perform a `withdraw margin` operation
                    </span>
                  }
                  contentClassName="w-60"
                  className="w-fit"
                >
                  <Image width={16} height={16} alt="Info" src="/images/info.svg" />
                </Tooltip>
              </div>
            ),
            children: (
              <LabelSection label="Withdraw Amount" height={height}>
                <BalanceInput token={undefined} />
              </LabelSection>
            ),
            disabled: true,
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
