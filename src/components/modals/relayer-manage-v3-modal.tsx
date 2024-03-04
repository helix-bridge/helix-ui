import { useLiquidityWithdrawFeeParams, useRelayerV3, useWithdrawableLiquidities } from "@/hooks";
import { InputValue, LnBridgeRelayerOverview, Token } from "@/types";
import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import { formatBalance, formatFeeRate, getChainConfig, notifyError } from "@/utils";
import dynamic from "next/dynamic";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { TransactionReceipt } from "viem";
import { BalanceInput } from "../balance-input";
import FeeRateInput from "../fee-rate-input";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import CountLoading from "@/ui/count-loading";
import WithdrawableLiquiditiesSelect from "../withdrawable-liquidities-select";

type TabKey = "update" | "deposit" | "withdraw penalty reserve" | "withdraw liquidity" | "allowance";
const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

const bigintInputDefaultValue: InputValue<bigint> = { input: "", valid: true, value: 0n };
const numberInputDefaultValue: InputValue<number> = { input: "", valid: true, value: 0 };

interface Props {
  relayerInfo?: LnBridgeRelayerOverview;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function covertToBigIntInputValue(value: bigint | undefined, token: Token): InputValue<bigint> {
  return { valid: true, value: value ?? 0n, input: value ? (value / 10n ** BigInt(token.decimals)).toString() : "" };
}

export default function RelayerManageV3Modal({ relayerInfo, isOpen, onClose, onSuccess }: Props) {
  const {
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    sourceBalance,
    targetBalance,
    sourceAllowance,
    penaltyReserve,
    isGettingPenaltyReserves,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    registerLnProvider,
    depositPenaltyReserve,
    withdrawPenaltyReserve,
    withdrawLiquidity,
    targetApprove,
  } = useRelayerV3();
  const [penaltyReserveInput, setPenaltyReserveInput] = useState(bigintInputDefaultValue);
  const [transferLimitInput, setTransferLimitInput] = useState(bigintInputDefaultValue);
  const [withdrawInput, setWithdrawInput] = useState(bigintInputDefaultValue);
  const [baseFeeInput, setBaseFeeInput] = useState(bigintInputDefaultValue);
  const [allowanceInput, setAllowanceInput] = useState(bigintInputDefaultValue);
  const [feeRateInput, setFeeRateInput] = useState(numberInputDefaultValue);

  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("update");
  const [busy, setBusy] = useState(false);

  const { switchNetwork } = useSwitchNetwork();
  const { chain } = useNetwork();

  const {
    loading: isLoadingWithdrawableLiquidities,
    total: totalWithdrawableLiquidities,
    data: withdrawableLiquidities,
    refetch: refetchWithdrawableLiquidities,
    fetchMore: fetchMoreWithdrawableLiquidities,
  } = useWithdrawableLiquidities(
    relayerInfo?.relayer,
    targetToken?.address,
    relayerInfo?.fromChain,
    relayerInfo?.toChain,
  );
  const [selectedLiquidities, setSelectedLiquidities] = useState<{ id: string }[]>([]);
  const { feeAndParams: withdrawFeeAndParams, loading: isLoadingWithdrawFee } = useLiquidityWithdrawFeeParams(
    selectedLiquidities,
    relayerInfo?.relayer,
    relayerInfo?.messageChannel,
  );

  const { okText, okDisabled } = useMemo(() => {
    let okText: "Confirm" | "Approve" | "Switch Network" = "Confirm";
    let okDisabled = false;

    if (activeKey === "allowance") {
      if (chain?.id !== targetChain?.id) {
        okText = "Switch Network";
      } else if (!allowanceInput.input || !allowanceInput.valid) {
        okDisabled = true;
      }
    } else if (activeKey === "withdraw liquidity") {
      if (chain?.id !== targetChain?.id) {
        okText = "Switch Network";
      } else if (!selectedLiquidities.length || isLoadingWithdrawFee || !withdrawFeeAndParams) {
        okDisabled = true;
      }
    } else if (chain?.id !== sourceChain?.id) {
      okText = "Switch Network";
    } else if (activeKey === "deposit") {
      if (!penaltyReserveInput.input || !penaltyReserveInput.valid) {
        okDisabled = true;
      } else if (sourceToken?.type !== "native" && penaltyReserveInput.value > (sourceAllowance?.value ?? 0n)) {
        okText = "Approve";
      }
    } else if (activeKey === "update") {
      if (
        !transferLimitInput.input ||
        !transferLimitInput.valid ||
        !baseFeeInput.input ||
        !baseFeeInput.valid ||
        !feeRateInput.input ||
        !feeRateInput.valid
      ) {
        okDisabled = true;
      }
    } else if (activeKey === "withdraw penalty reserve") {
      if (penaltyReserve === undefined || isGettingPenaltyReserves || !withdrawInput.input || !withdrawInput.valid) {
        okDisabled = true;
      }
    }

    return { okText, okDisabled };
  }, [
    activeKey,
    baseFeeInput,
    chain?.id,
    feeRateInput,
    penaltyReserveInput,
    sourceAllowance?.value,
    sourceChain?.id,
    targetChain?.id,
    sourceToken?.type,
    transferLimitInput,
    withdrawInput,
    penaltyReserve,
    isGettingPenaltyReserves,
    selectedLiquidities.length,
    isLoadingWithdrawFee,
    withdrawFeeAndParams,
    allowanceInput,
  ]);

  const { baseFee, feeRate, transferLimit } = useMemo(() => {
    const baseFee = BigInt(relayerInfo?.baseFee ?? 0);
    const feeRate = Number(relayerInfo?.liquidityFeeRate ?? 0);
    const transferLimit = BigInt(relayerInfo?.transferLimit ?? 0);
    return { baseFee, feeRate, transferLimit };
  }, [relayerInfo]);

  const handleOkClick = useCallback(async () => {
    let receipt: TransactionReceipt | undefined;
    setBusy(true);

    try {
      if (activeKey === "allowance") {
        if (chain?.id !== targetChain?.id) {
          switchNetwork?.(targetChain?.id);
        } else {
          receipt = await targetApprove(allowanceInput.value);
        }
      } else if (activeKey === "withdraw liquidity") {
        if (chain?.id !== targetChain?.id) {
          switchNetwork?.(targetChain?.id);
        } else {
          receipt = await withdrawLiquidity(
            selectedLiquidities,
            withdrawFeeAndParams?.value ?? 0n,
            withdrawFeeAndParams?.params,
          );
          if (receipt?.status === "success") {
            refetchWithdrawableLiquidities();
          }
        }
      } else if (chain?.id !== sourceChain?.id) {
        switchNetwork?.(sourceChain?.id);
      } else if (activeKey === "update") {
        receipt = await registerLnProvider(baseFeeInput.value, feeRateInput.value, transferLimitInput.value);
      } else if (activeKey === "deposit") {
        receipt = await depositPenaltyReserve(penaltyReserveInput.value);
      } else if (activeKey === "withdraw penalty reserve") {
        receipt = await withdrawPenaltyReserve(withdrawInput.value);
      }
    } catch (err) {
      console.error(err);
      notifyError(err);
    } finally {
      if (receipt?.status === "success") {
        onClose();
        onSuccess();
      }
    }

    setBusy(false);
  }, [
    chain?.id,
    sourceChain?.id,
    targetChain?.id,
    activeKey,
    baseFeeInput,
    feeRateInput,
    penaltyReserveInput,
    transferLimitInput,
    withdrawInput,
    selectedLiquidities,
    withdrawFeeAndParams,
    allowanceInput,
    depositPenaltyReserve,
    onClose,
    onSuccess,
    registerLnProvider,
    switchNetwork,
    withdrawPenaltyReserve,
    withdrawLiquidity,
    refetchWithdrawableLiquidities,
    targetApprove,
  ]);

  useEffect(() => {
    setPenaltyReserveInput(bigintInputDefaultValue);
    setTransferLimitInput(bigintInputDefaultValue);
    setWithdrawInput(bigintInputDefaultValue);
    setBaseFeeInput(bigintInputDefaultValue);
    setAllowanceInput(bigintInputDefaultValue);
    setFeeRateInput(numberInputDefaultValue);
    setSelectedLiquidities([]);

    const _sourceChain = getChainConfig(relayerInfo?.fromChain);
    const _targetChain = getChainConfig(relayerInfo?.toChain);
    const _sourceToken = _sourceChain?.tokens.find(
      (t) => t.address.toLowerCase() === relayerInfo?.sendToken?.toLowerCase(),
    );

    setSourceChain(_sourceChain);
    setTargetChain(_targetChain);
    setSourceToken(_sourceToken);
    setActiveKey("update");
  }, [relayerInfo, setSourceChain, setTargetChain, setSourceToken]);

  useEffect(() => {
    if (sourceToken) {
      setPenaltyReserveInput(bigintInputDefaultValue);
      setTransferLimitInput(covertToBigIntInputValue(transferLimit, sourceToken));
      setWithdrawInput(covertToBigIntInputValue(penaltyReserve, sourceToken));
      setBaseFeeInput(covertToBigIntInputValue(baseFee, sourceToken));
      setFeeRateInput({ valid: true, value: feeRate, input: formatFeeRate(feeRate).toString() });
    }
  }, [activeKey, sourceToken, transferLimit, penaltyReserve, baseFee, feeRate]);

  return (
    <Modal
      title="Manage Relayer"
      className="w-full lg:w-[32rem]"
      okText={okText}
      isOpen={isOpen}
      onClose={onClose}
      onOk={handleOkClick}
      busy={busy}
      disabledCancel={busy}
      disabledOk={okDisabled}
      onCancel={onClose}
    >
      <SegmentedTabs
        options={[
          {
            key: "update",
            label: <span className="text-sm font-extrabold">Update</span>,
            children: (
              <div className="flex flex-col gap-5">
                <Label text="Base Fee">
                  <BalanceInput
                    compact
                    token={sourceToken}
                    suffix="symbol"
                    value={baseFeeInput}
                    onChange={setBaseFeeInput}
                  />
                </Label>
                <Label text="Liquidity Fee Rate">
                  <FeeRateInput
                    isV3
                    value={feeRateInput}
                    placeholder={feeRate === undefined ? undefined : `${formatFeeRate(feeRate)}%`}
                    onChange={setFeeRateInput}
                  />
                </Label>
                <Label text="Trasfer Limit">
                  <BalanceInput
                    compact
                    token={sourceToken}
                    suffix="symbol"
                    value={transferLimitInput}
                    onChange={setTransferLimitInput}
                  />
                </Label>
              </div>
            ),
          },
          {
            key: "deposit",
            label: <span className="text-sm font-extrabold">Deposit</span>,
            children: (
              <Label text="More Penalty Reserves">
                <BalanceInput
                  compact
                  balance={sourceBalance?.value}
                  token={sourceBalance?.token}
                  suffix="symbol"
                  value={penaltyReserveInput}
                  onChange={setPenaltyReserveInput}
                />
              </Label>
            ),
          },
          {
            key: "withdraw penalty reserve",
            label: <span className="text-sm font-extrabold">Penalty</span>,
            children: (
              <div className="flex flex-col gap-5">
                <Label text="Withdraw Penalty Reserves">
                  <div className="relative">
                    {isGettingPenaltyReserves && (
                      <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center pl-2">
                        <CountLoading size="small" color="white" />
                      </div>
                    )}
                    <BalanceInput
                      balance={penaltyReserve}
                      token={sourceToken}
                      compact
                      suffix="symbol"
                      value={withdrawInput}
                      onChange={setWithdrawInput}
                    />
                  </div>
                </Label>
              </div>
            ),
          },
          {
            key: "withdraw liquidity",
            label: <span className="text-sm font-extrabold">Liquidity</span>,
            children: (
              <div className="flex flex-col gap-5">
                <Label text="Withdrawable Liquidity">
                  <WithdrawableLiquiditiesSelect
                    loading={isLoadingWithdrawableLiquidities}
                    total={totalWithdrawableLiquidities}
                    value={selectedLiquidities}
                    options={withdrawableLiquidities}
                    onChange={setSelectedLiquidities}
                    onLoadMore={fetchMoreWithdrawableLiquidities}
                  />
                </Label>
                {selectedLiquidities.length ? (
                  <Label text="Withdraw Fee" tips="This value is calculated and does not require input">
                    <div
                      className={`relative flex h-10 items-center justify-between rounded-medium border bg-inner px-small lg:px-medium ${
                        withdrawFeeAndParams || isLoadingWithdrawFee ? "border-transparent" : "border-app-red"
                      }`}
                    >
                      {isLoadingWithdrawFee ? (
                        <CountLoading size="small" color="white" />
                      ) : withdrawFeeAndParams ? (
                        <>
                          <span className="text-sm font-medium text-white">
                            {formatBalance(withdrawFeeAndParams.value, withdrawFeeAndParams.token.decimals, {
                              precision: 6,
                            })}
                          </span>
                          <span className="text-sm font-medium text-white">{withdrawFeeAndParams.token.symbol}</span>
                        </>
                      ) : (
                        <span className="absolute -bottom-5 left-0 text-xs font-medium text-app-red">
                          * Failed to get fee, withdraw is temporarily unavailable
                        </span>
                      )}
                    </div>
                  </Label>
                ) : null}
              </div>
            ),
          },
          {
            key: "allowance",
            label: <span className="text-sm font-extrabold">Allowance</span>,
            children: (
              <div className="flex flex-col gap-5">
                <Label text="Approve Amount">
                  <BalanceInput
                    balance={targetBalance?.value}
                    token={targetBalance?.token}
                    value={allowanceInput}
                    suffix="symbol"
                    compact
                    onChange={setAllowanceInput}
                  />
                </Label>
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

function Label({ text, children, height, tips }: PropsWithChildren<{ text: string; height?: number; tips?: string }>) {
  return (
    <div className="flex flex-col gap-medium" style={{ height }}>
      <div className="flex items-center gap-small">
        <span className="text-sm font-extrabold">{text}</span>
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
