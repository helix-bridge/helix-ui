"use client";

import { GQL_QUERY_LNV20_RELAY_INFOS } from "@/config";
import { useRelayer } from "@/hooks";
import {
  BridgeCategory,
  ChainConfig,
  InputValue,
  QueryLnV20RelayInfosReqParams,
  QueryLnV20RelayInfosResData,
  Token,
} from "@/types";
import { notification } from "@/ui/notification";
import StepTitle from "@/ui/step-title";
import Tooltip from "@/ui/tooltip";
import {
  formatBalance,
  formatFeeRate,
  getAvailableBridges,
  getChainLogoSrc,
  getLnBridgeAvailableSourceTokens,
  getLnBridgeAvailableTargetChains,
  getLnBridgeCrossDefaultValue,
  getTokenLogoSrc,
  isValidFeeRate,
  notifyError,
} from "@/utils";
import { useApolloClient } from "@apollo/client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";
import Image from "next/image";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { Address, useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import ChainSelect from "./chain-select";
import TokenSelect from "./token-select";
import Button from "@/ui/button";
import StepCompleteItem from "./step-complete-item";
import { BalanceInput } from "./balance-input";
import FeeRateInput from "./fee-rate-input";
import { TransactionReceipt } from "viem";
import PrettyAddress from "./pretty-address";

enum Step {
  ONE,
  COMPLETE_ONE,
  TWO,
  COMPLETE_TWO,
  THREE,
  COMPLETE_THREE,
}
const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

const { defaultSourceChains, defaultTargetChains } = getLnBridgeCrossDefaultValue();

export default function RelayerRegister() {
  const {
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    sourceAllowance,
    sourceBalance,
    targetAllowance,
    targetBalance,
    bridgeCategory,
    defaultBridge,
    oppositeBridge,
    setBridgeCategory,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    setFeeAndRate,
    sourceApprove,
    targetApprove,
    depositMargin,
    updateFeeAndMargin,
    isLnBridgeExist,
  } = useRelayer();
  const [isSettingDefaultMargin, setIsSettingDefaultMargin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [completeMargin, setCompleteMargin] = useState(false);
  const [currentStep, setCurrentStep] = useState(Step.ONE);

  const [marginInput, setMarginInput] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [baseFeeInput, setBaseFeeInput] = useState<InputValue<bigint>>({ input: "", valid: true, value: 0n });
  const [feeRateInput, setFeeRateInput] = useState<InputValue<number>>({ input: "", valid: true, value: 0 });

  const apolloClient = useApolloClient();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const isRegistered = useCallback(
    async (
      relayer: Address,
      _sourceChain: ChainConfig,
      _targetChain: ChainConfig,
      _sourceToken: Token,
      _category: BridgeCategory,
    ) => {
      const { data: relayerData } = await apolloClient.query<
        QueryLnV20RelayInfosResData,
        QueryLnV20RelayInfosReqParams
      >({
        query: GQL_QUERY_LNV20_RELAY_INFOS,
        variables: {
          fromChain: _sourceChain.network,
          toChain: _targetChain.network,
          bridge: _category,
          relayer: relayer.toLowerCase(),
          page: 0,
          row: 2,
        },
        fetchPolicy: "no-cache",
      });

      if (
        relayerData.queryLnv20RelayInfos?.records.some(
          ({ sendToken }) => sendToken?.toLowerCase() === _sourceToken.address.toLowerCase(),
        )
      ) {
        notification.warn({
          title: "Transaction failed",
          description: `You have registered a relayer that supports this cross-chain.`,
        });
        return true;
      } else {
        return false;
      }
    },
    [apolloClient],
  );

  useEffect(() => {
    setBridgeCategory(getAvailableBridges(sourceChain, targetChain, sourceToken).at(0));
  }, [sourceChain, targetChain, sourceToken, setBridgeCategory]);

  return (
    <>
      <div className="mx-auto flex w-full flex-col gap-5 lg:w-[38.75rem]">
        {/* Step 1 */}
        <div className="flex flex-col gap-5 rounded-large bg-component p-5 lg:p-[1.875rem]">
          <StepTitle step={1} title="Select Chain and Token" />

          {Step.ONE === currentStep && (
            <>
              <Description content="Different source chains and target chains correspond to different bridge types. In different bridge types, the relayer is required to set margin on different chains. When the bridge type is 'default', the relayer needs to set margin on the target chain. If the bridge type is 'opposite', the relayer must set margin on the source chain." />

              <Divider />

              <div className="flex items-center gap-middle lg:gap-5">
                <LabelItem label="From" className="flex-1">
                  <ChainSelect
                    compact
                    className="bg-inner px-middle py-middle"
                    options={defaultSourceChains}
                    placeholder="Source chain"
                    value={sourceChain}
                    onChange={(value) => {
                      setSourceChain(value);
                      setTargetChain(undefined);
                      setSourceToken(undefined);
                    }}
                  />
                </LabelItem>
                <LabelItem label="To" className="flex-1">
                  <ChainSelect
                    compact
                    className="bg-inner px-middle py-middle"
                    options={getLnBridgeAvailableTargetChains(sourceChain, defaultTargetChains)}
                    placeholder="Target chain"
                    value={targetChain}
                    onChange={(value) => {
                      setTargetChain(value);
                      setSourceToken(undefined);
                    }}
                  />
                </LabelItem>
              </div>

              <LabelItem label="Token">
                <TokenSelect
                  className="bg-inner px-middle py-middle"
                  disabled={!getLnBridgeAvailableSourceTokens(sourceChain, targetChain).length}
                  options={getLnBridgeAvailableSourceTokens(sourceChain, targetChain)}
                  placeholder="Select token"
                  value={sourceToken}
                  onChange={setSourceToken}
                />
              </LabelItem>

              <Divider />

              <Button
                onClick={() => {
                  if (address) {
                    setCurrentStep(Step.COMPLETE_ONE);
                  } else {
                    openConnectModal?.();
                  }
                }}
                kind="primary"
                className="flex h-9 items-center justify-center rounded-middle"
                disabled={!sourceToken}
              >
                <span className="text-base font-normal text-white">{address ? "Confirm" : "Connect Wallet"}</span>
              </Button>
            </>
          )}
          {Step.COMPLETE_ONE <= currentStep && (
            <>
              <Divider />

              <div className="flex items-center justify-between gap-small">
                <StepCompleteItem property="Address" address={address} />
                <StepCompleteItem property="Bridge Type" bridge={bridgeCategory} />
                <StepCompleteItem property="From" chain={sourceChain} />
                <StepCompleteItem property="To" chain={targetChain} />
                <StepCompleteItem property="Token" token={sourceToken} />
              </div>

              <Divider />

              <div className="flex items-center gap-5">
                <Button
                  kind="default"
                  onClick={() => {
                    setSourceChain(undefined);
                    setTargetChain(undefined);
                    setSourceToken(undefined);
                    setMarginInput({ input: "", valid: true, value: 0n });
                    setBaseFeeInput({ input: "", valid: true, value: 0n });
                    setFeeRateInput({ input: "", valid: true, value: 0 });
                    setCurrentStep(Step.ONE);
                    setCompleteMargin(false);
                  }}
                  className="flex h-9 flex-1 items-center justify-center rounded-middle"
                >
                  <span className="text-base font-normal">Reset</span>
                </Button>
                <Button
                  kind="primary"
                  onClick={() => setCurrentStep(Step.TWO)}
                  className="flex h-9 flex-1 items-center justify-center rounded-middle"
                  disabled={Step.COMPLETE_ONE !== currentStep}
                >
                  <span className="text-base font-normal">Next</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-5 rounded-large bg-component p-5 lg:p-[1.875rem]">
          <StepTitle step={2} title="Deposit Margin and Set Fee" />

          {Step.TWO === currentStep && (
            <>
              <Description content="When a relayer engages in misconduct, their margin will be used for compensation. The fee charged by the relayer in the source chain from user transactions is baseFee + transferAmount * liquidityFeeRate." />

              <Divider />

              <LabelItem label="Deposit Margin">
                <BalanceInput
                  compact
                  balance={bridgeCategory === "lnbridgev20-default" ? targetBalance?.value : sourceBalance?.value}
                  token={bridgeCategory === "lnbridgev20-default" ? targetBalance?.token : sourceBalance?.token}
                  value={marginInput}
                  suffix="symbol"
                  disabled={completeMargin}
                  onChange={setMarginInput}
                />
              </LabelItem>

              {bridgeCategory === "lnbridgev20-default" && (
                <>
                  <Button
                    kind="primary"
                    className="flex h-9 items-center justify-center rounded-middle"
                    disabled={completeMargin || (targetChain?.id === chain?.id && marginInput.value === 0n)}
                    busy={isSettingDefaultMargin}
                    onClick={async () => {
                      if (address && defaultBridge && sourceChain && targetChain && sourceToken && targetToken) {
                        setIsSettingDefaultMargin(true);
                        try {
                          if (targetChain.id !== chain?.id) {
                            switchNetwork?.(targetChain.id);
                          } else if (
                            targetToken?.type !== "native" &&
                            marginInput.value > (targetAllowance?.value || 0n)
                          ) {
                            await targetApprove(address, marginInput.value, defaultBridge, targetChain);
                          } else if (
                            await isLnBridgeExist(apolloClient, sourceChain, targetChain, sourceToken, targetToken)
                          ) {
                            if (!(await isRegistered(address, sourceChain, targetChain, sourceToken, bridgeCategory))) {
                              const receipt = await depositMargin(
                                address,
                                marginInput.value,
                                defaultBridge,
                                targetChain,
                              );
                              if (receipt?.status === "success") {
                                setCompleteMargin(true);
                              }
                            }
                          } else {
                            notification.warn({
                              title: "Deposit failed",
                              description: `The bridge does not exist.`,
                            });
                          }
                        } catch (err) {
                          console.error(err);
                          notifyError(err);
                        } finally {
                          setIsSettingDefaultMargin(false);
                        }
                      }
                    }}
                  >
                    <span className="text-base font-normal">
                      {!completeMargin && targetChain?.id !== chain?.id
                        ? "Switch Network"
                        : !completeMargin &&
                          targetToken?.type !== "native" &&
                          marginInput.value > (targetAllowance?.value || 0n)
                        ? "Approve"
                        : "Confirm"}
                    </span>
                  </Button>
                  <Divider />
                </>
              )}

              <LabelItem label="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction">
                <BalanceInput
                  compact
                  token={sourceToken}
                  suffix="symbol"
                  value={baseFeeInput}
                  onChange={setBaseFeeInput}
                />
              </LabelItem>
              <LabelItem
                label="Liquidity Fee Rate"
                tips="The percentage deducted by the relayer from the transfer amount in a transaction"
              >
                <FeeRateInput placeholder="Enter 0 ~ 0.25" value={feeRateInput} onChange={setFeeRateInput} />
              </LabelItem>

              <Divider />

              <Button
                kind="primary"
                disabled={
                  sourceChain?.id === chain?.id &&
                  !(marginInput.input && baseFeeInput.input && feeRateInput.input && isValidFeeRate(feeRateInput.value))
                }
                busy={busy}
                className="flex h-9 items-center justify-center rounded-middle"
                onClick={async () => {
                  let receipt: TransactionReceipt | undefined;
                  if (address && sourceChain && targetChain && sourceToken && targetToken) {
                    setBusy(true);
                    try {
                      if (sourceChain.id !== chain?.id) {
                        switchNetwork?.(sourceChain.id);
                      } else if (
                        oppositeBridge &&
                        sourceToken?.type !== "native" &&
                        bridgeCategory === "lnbridgev20-opposite" &&
                        marginInput.value > (sourceAllowance?.value || 0n)
                      ) {
                        await sourceApprove(address, marginInput.value, oppositeBridge, sourceChain);
                      } else if (bridgeCategory === "lnbridgev20-default" && defaultBridge) {
                        receipt = await setFeeAndRate(
                          baseFeeInput.value,
                          feeRateInput.value,
                          defaultBridge,
                          sourceChain,
                        );
                      } else if (
                        oppositeBridge &&
                        bridgeCategory &&
                        (await isLnBridgeExist(apolloClient, sourceChain, targetChain, sourceToken, targetToken))
                      ) {
                        if (!(await isRegistered(address, sourceChain, targetChain, sourceToken, bridgeCategory))) {
                          receipt = await updateFeeAndMargin(
                            address,
                            marginInput.value,
                            baseFeeInput.value,
                            feeRateInput.value,
                            oppositeBridge,
                            sourceChain,
                          );
                        }
                      } else {
                        notification.warn({
                          title: "Deposit failed",
                          description: `The bridge does not exist.`,
                        });
                      }
                    } catch (err) {
                      console.error(err);
                      notifyError(err);
                    } finally {
                      setBusy(false);
                      if (receipt?.status === "success") {
                        setCurrentStep(Step.THREE);
                      }
                    }
                  }
                }}
              >
                <span className="text-base font-normal">
                  {bridgeCategory === "lnbridgev20-default"
                    ? sourceChain?.id !== chain?.id
                      ? "Switch Network"
                      : "Confirm"
                    : bridgeCategory === "lnbridgev20-opposite"
                    ? sourceChain?.id !== chain?.id
                      ? "Switch Network"
                      : sourceToken?.type !== "native" && marginInput.value > (sourceAllowance?.value || 0n)
                      ? "Approve"
                      : "Confirm"
                    : "Confirm"}
                </span>
              </Button>
            </>
          )}
          {Step.COMPLETE_TWO <= currentStep && (
            <>
              <Divider />
              <div className="flex items-center justify-between gap-small">
                <StepCompleteItem
                  property="Margin"
                  token={
                    bridgeCategory === "lnbridgev20-default"
                      ? targetToken
                      : bridgeCategory === "lnbridgev20-opposite"
                      ? sourceToken
                      : undefined
                  }
                  balance={marginInput.value}
                />
                <StepCompleteItem property="Base Fee" token={sourceToken} balance={baseFeeInput.value} />
                <StepCompleteItem property="Liquidity Fee Rate" percent={formatFeeRate(feeRateInput.value)} />
              </div>
            </>
          )}
        </div>

        {/* Step 3 */}
        <div className="flex flex-col gap-5 rounded-large bg-component p-5 lg:p-[1.875rem]">
          <StepTitle step={3} title="Authorize Token on Target Chain and Run Relayer" />

          {Step.THREE === currentStep && (
            <>
              <Description content="Authorize token on target chain and run relayer to start relaying messages and earn rewards. Please note this step authorizes tokens for the relayer to send to users' target chain address based on transactions. Ensure you authorize enough tokens for multiple transactions as needed." />

              <Divider />

              <LabelItem label="Current Allowance">
                <BalanceInput
                  token={targetToken}
                  disabled
                  value={{
                    value: targetAllowance?.value ?? 0n,
                    input: formatBalance(targetAllowance?.value ?? 0n, targetAllowance?.token.decimals ?? 0),
                    valid: true,
                  }}
                  compact
                  suffix="symbol"
                  placeholder="-"
                />
              </LabelItem>

              <div className="flex items-center gap-middle lg:gap-5">
                <Button
                  kind="primary"
                  onClick={async () => {
                    if (address && targetChain) {
                      setBusy(true);
                      try {
                        if (chain?.id !== targetChain.id) {
                          switchNetwork?.(targetChain.id);
                        } else if (defaultBridge) {
                          await targetApprove(address, targetBalance?.value || 0n, defaultBridge, targetChain);
                        } else if (oppositeBridge) {
                          await targetApprove(address, targetBalance?.value || 0n, oppositeBridge, targetChain);
                        }
                      } catch (err) {
                        console.error(err);
                        notifyError(err);
                      } finally {
                        setBusy(false);
                      }
                    }
                  }}
                  className="flex h-9 flex-1 items-center justify-center rounded-middle"
                  busy={busy}
                  disabled={sourceToken?.type === "native"}
                >
                  <span className="text-base font-normal">
                    {chain?.id === targetChain?.id ? "Approve More" : "Switch Network"}
                  </span>
                </Button>
                <Button
                  kind="default"
                  onClick={() => setIsOpen(true)}
                  className="flex h-9 flex-1 items-center justify-center rounded-middle"
                >
                  <span className="text-base font-normal">Next</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title="One More Step!"
        subTitle={
          <div className="flex flex-wrap items-center text-sm font-extrabold text-white">
            Now&nbsp;
            <RunRelayer style="link" />
            &nbsp;to start relaying messages and earn rewards.
          </div>
        }
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div
          className="grid items-center gap-x-small gap-y-5 text-sm font-normal text-white"
          style={{ gridTemplateColumns: "130px auto" }}
        >
          <span className="text-sm font-medium text-white">Address</span>
          {address ? <PrettyAddress address={address} /> : null}

          <span className="text-sm font-medium text-white">Bridge Type</span>
          <span>
            {bridgeCategory === "lnbridgev20-default"
              ? "Default"
              : bridgeCategory === "lnbridgev20-opposite"
              ? "Opposite"
              : "-"}
          </span>

          <span className="text-sm font-medium text-white">From</span>
          <PrettyChain chain={sourceChain} />

          <span className="text-sm font-medium text-white">To</span>
          <PrettyChain chain={targetChain} />

          <span className="text-sm font-medium text-white">Token</span>
          <PrettyToken token={sourceToken} />

          <span className="text-sm font-medium text-white">Margin</span>
          <PrettyMargin
            margin={marginInput.value}
            token={bridgeCategory === "lnbridgev20-default" ? targetToken : sourceToken}
          />

          <span className="text-sm font-medium text-white">Base Fee</span>
          <PrettyBaseFee fee={baseFeeInput.value} token={sourceToken} />

          <span className="text-sm font-medium text-white">Liquidity Fee Rate</span>
          <span>{formatFeeRate(feeRateInput.value)}%</span>
        </div>

        <Divider />

        <div className="flex items-center gap-middle lg:gap-5">
          <RunRelayer style="button" />
          <Button
            kind="default"
            onClick={() => {
              setIsOpen(false);
              setSourceChain(undefined);
              setTargetChain(undefined);
              setSourceToken(undefined);
              setMarginInput({ input: "", valid: true, value: 0n });
              setBaseFeeInput({ input: "", valid: true, value: 0n });
              setFeeRateInput({ input: "", valid: true, value: 0 });
              setCurrentStep(Step.ONE);
              setCompleteMargin(false);
            }}
            className="flex h-8 flex-1 items-center justify-center rounded-middle lg:h-9"
          >
            <span className="text-base font-normal">Register Another</span>
          </Button>
        </div>
      </Modal>
    </>
  );
}

function RunRelayer({ style, onClick = () => undefined }: { style: "button" | "link"; onClick?: () => void }) {
  return (
    <a
      href="https://github.com/helix-bridge/relayer/tree/main"
      className={`inline-flex items-center justify-center ${
        style === "button"
          ? `border-radius h-8 flex-1 items-center justify-center rounded-middle bg-primary text-base font-normal text-white transition hover:opacity-80 active:translate-y-1 lg:h-9`
          : "text-sm font-extrabold text-primary hover:underline"
      }`}
      rel="noopener"
      target="_blank"
      onClick={onClick}
    >
      {style === "button" ? "Run Relayer" : "Run a Relayer"}
    </a>
  );
}

function LabelItem({
  children,
  label,
  tips,
  className,
}: PropsWithChildren<{ label: string; tips?: string; className?: string }>) {
  return (
    <div className={`flex flex-col gap-middle ${className}`}>
      <div className="flex items-center gap-small">
        <span className="text-sm font-extrabold text-white">{label}</span>
        {tips ? (
          <Tooltip content={tips} className="w-fit" contentClassName="max-w-[18rem]">
            <Image width={16} height={16} alt="Info" src="/images/info.svg" />
          </Tooltip>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function Description({ content }: { content: string }) {
  return <span className="text-sm font-medium text-white/50">{content}</span>;
}

function PrettyChain({ chain }: { chain?: ChainConfig }) {
  return chain ? (
    <div className="flex items-center gap-small">
      <Image width={16} height={16} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />
      <span>{chain.name}</span>
    </div>
  ) : (
    ""
  );
}

function PrettyToken({ token }: { token?: Token }) {
  return token ? (
    <div className="flex items-center gap-small">
      <Image width={16} height={16} alt="Chain" src={getTokenLogoSrc(token.logo)} className="shrink-0 rounded-full" />
      <span>{token.symbol}</span>
    </div>
  ) : (
    ""
  );
}

function PrettyMargin({ token, margin }: { token?: Token; margin: bigint }) {
  return <span>{token ? formatBalance(margin, token.decimals) : ""}</span>;
}

function PrettyBaseFee({ fee, token }: { fee: bigint; token?: Token }) {
  return <span>{token ? formatBalance(fee, token.decimals) : ""}</span>;
}

function Divider() {
  return <div className="h-[1px] bg-white/10" />;
}
