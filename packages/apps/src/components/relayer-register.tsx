"use client";

import Button from "@/ui/button";
import { Divider } from "@/ui/divider";
import StepNumber from "@/ui/step-number";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import ChainSelect from "./chain-select";
import TokenSelect from "./token-select";
import { ChainConfig, ChainID } from "@/types/chain";
import { Token, TokenSymbol } from "@/types/token";
import { BridgeCategory } from "@/types/bridge";
import { Address, useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import Image from "next/image";
import { formatFeeRate, getChainLogoSrc, getTokenLogoSrc, isValidFeeRate } from "@/utils/misc";
import Tooltip from "@/ui/tooltip";
import StepCompleteItem from "./step-complete-item";
import { BalanceInput } from "./balance-input";
import PrettyAddress from "./pretty-address";
import FeeRateInput from "./fee-rate-input";
import { getParsedCrossChain } from "@/utils/cross-chain";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { formatBalance } from "@/utils/balance";
import { useApolloClient } from "@apollo/client";
import { QUERY_CHECK_LNBRIDGE_EXIST, QUERY_SPECIAL_RELAYER } from "@/config/gql";
import {
  CheckLnBridgeExistResponseData,
  CheckLnBridgeExistVariables,
  SpecialRelayerResponseData,
  SpecialRelayerVariables,
} from "@/types/graphql";
import { notification } from "@/ui/notification";
import { useRelayer } from "@/hooks/use-relayer";
import dynamic from "next/dynamic";

enum Step {
  ONE,
  COMPLETE_ONE,
  TWO,
  COMPLETE_TWO,
  THREE,
  COMPLETE_THREE,
}
const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

const { availableTargetChains, defaultSourceChains, defaultTargetChains, availableBridges, availableTokens } =
  getParsedCrossChain();

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
    margin,
    baseFee,
    feeRate,
    bridgeCategory,
    setMargin,
    setBaseFee,
    setFeeRate,
    setBridgeCategory,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    setFeeAndRate,
    sourceApprove,
    targetApprove,
    depositMargin,
    updateFeeAndMargin,
  } = useRelayer();
  const [isSettingDefaultMargin, setIsSettingDefaultMargin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [completeMargin, setCompleteMargin] = useState(false);
  const [currentStep, setCurrentStep] = useState(Step.ONE);
  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);

  const apolloClient = useApolloClient();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const isRegistered = async () => {
    const { data: relayerData } = await apolloClient.query<SpecialRelayerResponseData, SpecialRelayerVariables>({
      query: QUERY_SPECIAL_RELAYER,
      variables: {
        fromChain: sourceChain?.network,
        toChain: targetChain?.network,
        bridge: bridgeCategory,
        relayer: address?.toLowerCase(),
      },
      fetchPolicy: "no-cache",
    });

    if (
      relayerData.queryLnv20RelayInfos?.records.some(
        ({ sendToken }) => sendToken?.toLowerCase() === sourceToken?.address.toLowerCase(),
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
  };

  const isLnBridgeExist = useCallback(async () => {
    if (sourceChain && targetChain && sourceToken && targetToken) {
      const { data: lnbridgeData } = await apolloClient.query<
        CheckLnBridgeExistResponseData,
        CheckLnBridgeExistVariables
      >({
        query: QUERY_CHECK_LNBRIDGE_EXIST,
        variables: {
          fromChainId: sourceChain.id,
          toChainId: targetChain.id,
          fromToken: sourceToken.address,
          toToken: targetToken.address,
        },
        fetchPolicy: "no-cache",
      });

      if (lnbridgeData.checkLnBridgeExist) {
        return true;
      }
    }

    notification.warn({
      title: "Deposit failed",
      description: `The bridge does not exist.`,
    });
    console.warn("[isLnBridgeExist]", sourceChain?.id, targetChain?.id, sourceToken?.address, targetToken?.address);
    return false;
  }, [apolloClient, sourceChain, targetChain, sourceToken, targetToken]);

  useEffect(() => {
    const availableCategories = new Set<BridgeCategory>();

    if (sourceChain && targetChain) {
      (Object.keys(availableBridges[sourceChain.network]?.[targetChain.network] || {}) as TokenSymbol[]).forEach(
        (symbol) => {
          availableBridges[sourceChain.network]?.[targetChain.network]?.[symbol]?.forEach((category) => {
            if (category === "lnbridgev20-default" || category === "lnbridgev20-opposite") {
              availableCategories.add(category);
            }
          });
        },
      );
      setTokenOptions(availableTokens[sourceChain.network]?.[targetChain.network] || []);
    } else {
      setTokenOptions([]);
    }

    setBridgeCategory(Array.from(availableCategories).at(0));
  }, [sourceChain, targetChain, setBridgeCategory]);

  return (
    <>
      <div className="mx-auto flex w-full flex-col gap-5 lg:w-[38.75rem]">
        {/* step 1 */}
        <div className="bg-component flex flex-col gap-5 p-5 lg:p-[1.875rem]">
          <StepTitle step={1} title="Select Chain and Token" />

          {Step.ONE === currentStep && (
            <>
              <Description content="Different source chains and target chains correspond to different bridge types. In different bridge types, the relayer is required to set margin on different chains. When the bridge type is 'default', the relayer needs to set margin on the target chain. If the bridge type is 'opposite', the relayer must set margin on the source chain." />

              <Divider />

              <div className="gap-middle flex items-center lg:gap-5">
                <LabelItem label="From" className="flex-1">
                  <ChainSelect
                    className="px-middle bg-app-bg border-transparent py-2"
                    options={defaultSourceChains}
                    placeholder="Source chain"
                    onChange={(value) => {
                      setSourceChain(value);
                      setTargetChain(undefined);
                      setSourceToken(undefined);
                    }}
                    value={sourceChain}
                  />
                </LabelItem>
                <LabelItem label="To" className="flex-1">
                  <ChainSelect
                    className="px-middle bg-app-bg border-transparent py-2"
                    options={sourceChain ? availableTargetChains[sourceChain.network] || [] : defaultTargetChains}
                    placeholder="Target chain"
                    onChange={(value) => {
                      setTargetChain(value);
                      setSourceToken(undefined);
                    }}
                    value={targetChain}
                  />
                </LabelItem>
              </div>

              <LabelItem label="Token">
                <TokenSelect
                  className="px-middle bg-app-bg py-2"
                  disabled={!tokenOptions.length}
                  options={tokenOptions}
                  placeholder="Select token"
                  onChange={setSourceToken}
                  value={sourceToken}
                />
              </LabelItem>

              <Divider />

              <Button
                onClick={() => {
                  if (address) {
                    setCurrentStep(Step.COMPLETE_ONE);
                  } else if (openConnectModal) {
                    openConnectModal();
                  }
                }}
                kind="primary"
                className="flex h-9 items-center justify-center"
                disabled={!sourceToken}
              >
                <span className="text-sm font-medium text-white">{address ? "Confirm" : "Connect Wallet"}</span>
              </Button>
            </>
          )}
          {Step.COMPLETE_ONE <= currentStep && (
            <>
              <Divider />

              <div className="gap-small flex items-center justify-between">
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
                    setBridgeCategory(undefined);
                    setMargin({ formatted: 0n, value: "" });
                    setBaseFee({ formatted: 0n, value: "" });
                    setFeeRate({ formatted: 0, value: "" });
                    setCurrentStep(Step.ONE);
                    setCompleteMargin(false);
                  }}
                  className="flex h-9 flex-1 items-center justify-center"
                >
                  <span className="text-sm font-medium">Reset</span>
                </Button>
                <Button
                  kind="primary"
                  onClick={() => setCurrentStep(Step.TWO)}
                  className="flex h-9 flex-1 items-center justify-center"
                  disabled={Step.COMPLETE_ONE !== currentStep}
                >
                  <span className="text-sm font-medium">Next</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* step 2 */}
        <div className="bg-component flex flex-col gap-5 p-5 lg:p-[1.875rem]">
          <StepTitle step={2} title="Deposit Margin and Set Fee" />

          {Step.TWO === currentStep && (
            <>
              <Description content="When a relayer engages in misconduct, their margin will be used for compensation. The fee charged by the relayer in the source chain from user transactions is baseFee + transferAmount * liquidityFeeRate." />

              <Divider />

              <LabelItem label="Deposit Margin">
                <BalanceInput
                  balance={bridgeCategory === "lnbridgev20-default" ? targetBalance?.value : sourceBalance?.value}
                  token={bridgeCategory === "lnbridgev20-default" ? targetBalance?.token : sourceBalance?.token}
                  value={margin}
                  suffix="symbol"
                  disabled={completeMargin}
                  onChange={setMargin}
                />
              </LabelItem>

              {bridgeCategory === "lnbridgev20-default" && (
                <>
                  <Button
                    kind="primary"
                    onClick={async () => {
                      if (targetChain?.id !== chain?.id) {
                        switchNetwork?.(targetChain?.id);
                      } else if (targetToken?.type !== "native" && margin.formatted > (targetAllowance?.value || 0n)) {
                        try {
                          setIsSettingDefaultMargin(true);
                          await targetApprove(margin.formatted);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsSettingDefaultMargin(false);
                        }
                      } else {
                        try {
                          setIsSettingDefaultMargin(true);
                          if ((await isRegistered()) || !(await isLnBridgeExist())) {
                            setIsSettingDefaultMargin(false);
                            return;
                          }
                          const receipt = await depositMargin(margin.formatted);
                          if (receipt?.status === "success") {
                            setCompleteMargin(true);
                          }
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsSettingDefaultMargin(false);
                        }
                      }
                    }}
                    className="flex h-9 items-center justify-center"
                    disabled={completeMargin || (targetChain?.id === chain?.id && margin.formatted === 0n)}
                    busy={isSettingDefaultMargin}
                  >
                    <span className="text-sm font-medium text-white">
                      {!completeMargin && targetChain?.id !== chain?.id
                        ? "Switch Network"
                        : !completeMargin &&
                          targetToken?.type !== "native" &&
                          margin.formatted > (targetAllowance?.value || 0n)
                        ? "Approve"
                        : "Confirm"}
                    </span>
                  </Button>
                  <Divider />
                </>
              )}

              <LabelItem label="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction">
                <BalanceInput token={sourceToken} suffix="symbol" value={baseFee} onChange={setBaseFee} />
              </LabelItem>
              <LabelItem
                label="Liquidity Fee Rate"
                tips="The percentage deducted by the relayer from the transfer amount in a transaction"
              >
                <FeeRateInput placeholder="Enter 0 ~ 0.25" value={feeRate} onChange={setFeeRate} />
              </LabelItem>

              <Divider />

              <Button
                kind="primary"
                onClick={async () => {
                  if (sourceChain?.id !== chain?.id) {
                    switchNetwork?.(sourceChain?.id);
                  } else if (
                    sourceToken?.type !== "native" &&
                    bridgeCategory === "lnbridgev20-opposite" &&
                    margin.formatted > (sourceAllowance?.value || 0n)
                  ) {
                    try {
                      setBusy(true);
                      await sourceApprove(margin.formatted);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setBusy(false);
                    }
                  } else {
                    try {
                      setBusy(true);
                      if ((await isRegistered()) || !(await isLnBridgeExist())) {
                        setBusy(false);
                        return;
                      }
                      const receipt =
                        bridgeCategory === "lnbridgev20-default"
                          ? await setFeeAndRate(baseFee.formatted, feeRate.formatted)
                          : bridgeCategory === "lnbridgev20-opposite"
                          ? await updateFeeAndMargin(margin.formatted, baseFee.formatted, feeRate.formatted)
                          : undefined;
                      if (receipt?.status === "success") {
                        setCurrentStep(Step.THREE);
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setBusy(false);
                    }
                  }
                }}
                disabled={
                  sourceChain?.id === chain?.id &&
                  !(margin.value && baseFee.value && feeRate.value && isValidFeeRate(feeRate.formatted))
                }
                busy={busy}
                className="flex h-9 items-center justify-center"
              >
                <span className="text-sm font-medium text-white">
                  {bridgeCategory === "lnbridgev20-default"
                    ? sourceChain?.id !== chain?.id
                      ? "Switch Network"
                      : "Confirm"
                    : bridgeCategory === "lnbridgev20-opposite"
                    ? sourceChain?.id !== chain?.id
                      ? "Switch Network"
                      : sourceToken?.type !== "native" && margin.formatted > (sourceAllowance?.value || 0n)
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
              <div className="gap-small flex items-center justify-between">
                <StepCompleteItem
                  property="Margin"
                  token={
                    bridgeCategory === "lnbridgev20-default"
                      ? targetToken
                      : bridgeCategory === "lnbridgev20-opposite"
                      ? sourceToken
                      : undefined
                  }
                  balance={margin.formatted}
                />
                <StepCompleteItem property="Base Fee" token={sourceToken} balance={baseFee.formatted} />
                <StepCompleteItem property="Liquidity Fee Rate" percent={formatFeeRate(feeRate.formatted)} />
              </div>
            </>
          )}
        </div>

        {/* step 3 */}
        <div className="bg-component flex flex-col gap-5 p-5 lg:p-[1.875rem]">
          <StepTitle step={3} title="Authorize Token on Target Chain and Run Relayer" />

          {Step.THREE === currentStep && (
            <>
              <Description content="Authorize token on target chain and run relayer to start relaying messages and earn rewards. Please note this step authorizes tokens for the relayer to send to users' target chain address based on transactions. Ensure you authorize enough tokens for multiple transactions as needed." />

              <Divider />

              <LabelItem label="Current Allowance">
                <BalanceInput
                  token={targetToken}
                  disabled
                  value={
                    targetAllowance
                      ? {
                          formatted: targetAllowance.value,
                          value: formatBalance(targetAllowance.value, targetAllowance.token.decimals),
                        }
                      : undefined
                  }
                  placeholder="-"
                />
              </LabelItem>

              <div className="gap-middle flex items-center lg:gap-5">
                <Button
                  kind="primary"
                  onClick={async () => {
                    if (chain?.id !== targetChain?.id) {
                      switchNetwork?.(targetChain?.id);
                    } else {
                      try {
                        setBusy(true);
                        await targetApprove(targetBalance?.value || 0n);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setBusy(false);
                      }
                    }
                  }}
                  className="flex h-9 flex-1 items-center justify-center"
                  busy={busy}
                  disabled={sourceToken?.type === "native"}
                >
                  <span className="text-sm font-medium">
                    {chain?.id === targetChain?.id ? "Approve More" : "Switch Network"}
                  </span>
                </Button>
                <Button
                  kind="default"
                  onClick={() => setIsOpen(true)}
                  className="flex h-9 flex-1 items-center justify-center"
                >
                  <span className="text-sm font-medium">Next</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        title="One More Step!"
        subTitle={
          <div className="flex flex-wrap items-center text-sm">
            Now&nbsp;
            <RunRelayer style="link" />
            &nbsp;to start relaying messages and earn rewards.
          </div>
        }
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div
          className="gap-x-small grid items-center gap-y-5 text-sm font-normal text-white"
          style={{ gridTemplateColumns: "130px auto" }}
        >
          <span>Address</span>
          <PrettyAddress address={address || ""} />

          <span>Bridge Type</span>
          <span>
            {bridgeCategory === "lnbridgev20-default"
              ? "Default"
              : bridgeCategory === "lnbridgev20-opposite"
              ? "Opposite"
              : "-"}
          </span>

          <span>From</span>
          <PrettyChain chain={sourceChain} />

          <span>To</span>
          <PrettyChain chain={targetChain} />

          <span>Token</span>
          <PrettyToken token={sourceToken} />

          <span>Margin</span>
          <PrettyMargin
            margin={margin.formatted}
            token={bridgeCategory === "lnbridgev20-default" ? targetToken : sourceToken}
          />

          <span>Base Fee</span>
          <PrettyBaseFee fee={baseFee.formatted} token={sourceToken} />

          <span>Liquidity Fee Rate</span>
          <span>{formatFeeRate(feeRate.formatted)}%</span>
        </div>

        <Divider />

        <div className="gap-middle flex items-center lg:gap-5">
          <RunRelayer style="button" />
          <Button
            kind="default"
            onClick={() => {
              setIsOpen(false);
              setSourceChain(undefined);
              setTargetChain(undefined);
              setSourceToken(undefined);
              setMargin({ formatted: 0n, value: "" });
              setBaseFee({ formatted: 0n, value: "" });
              setFeeRate({ formatted: 0, value: "" });
              setCurrentStep(Step.ONE);
              setCompleteMargin(false);
            }}
            className="flex h-8 flex-1 items-center justify-center lg:h-9"
          >
            <span className="text-sm font-normal">Register Another</span>
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
      className={`inline-flex items-center justify-center text-sm font-medium ${
        style === "button"
          ? `bg-primary border-radius h-8 flex-1 items-center justify-center text-white transition hover:opacity-80 active:translate-y-1 lg:h-9`
          : "text-primary hover:underline"
      }`}
      rel="noopener"
      target="_blank"
      onClick={onClick}
    >
      {style === "button" ? "Run Relayer" : "Run a Relayer"}
    </a>
  );
}

function StepTitle({ step, title }: { step: number; title: string }) {
  return (
    <div className="gap-middle flex items-center">
      <StepNumber number={step} />
      <h5 className="text-xl font-semibold text-white">{title}</h5>
    </div>
  );
}

function LabelItem({
  children,
  label,
  tips,
  className,
}: PropsWithChildren<{ label: string; tips?: string; className?: string }>) {
  return (
    <div className={`gap-middle flex flex-col ${className}`}>
      <div className="gap-small flex items-center">
        <span className="text-sm font-normal text-white">{label}</span>
        {!!tips && (
          <Tooltip content={tips} className="w-fit" contentClassName="max-w-[18rem]">
            <Image width={16} height={16} alt="Info" src="/images/info.svg" />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

function Description({ content }: { content: string }) {
  return <span className="text-xs font-medium text-white/50">{content}</span>;
}

function PrettyChain({ chain }: { chain?: ChainConfig }) {
  return chain ? (
    <div className="gap-small flex items-center">
      <Image width={16} height={16} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />
      <span>{chain.name}</span>
    </div>
  ) : (
    ""
  );
}

function PrettyToken({ token }: { token?: Token }) {
  return token ? (
    <div className="gap-small flex items-center">
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
