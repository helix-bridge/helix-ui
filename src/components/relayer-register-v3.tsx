"use client";

import { useRelayerV3, useToggle } from "@/hooks";
import { ChainConfig, InputValue, Token } from "@/types";
import StepTitle from "@/ui/step-title";
import Tooltip from "@/ui/tooltip";
import {
  formatBalance,
  formatFeeRate,
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
import { PropsWithChildren, useCallback, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import ChainSelect from "./chain-select";
import TokenSelect from "./token-select";
import Button from "@/ui/button";
import StepCompleteItem from "./step-complete-item";
import { BalanceInput } from "./balance-input";
import FeeRateInput from "./fee-rate-input";
import PrettyAddress from "./pretty-address";

enum Step {
  ONE,
  ONE_SUMMARY,
  TWO,
  TWO_SUMMARY,
  THREE,
}
const Modal = dynamic(() => import("@/ui/modal"), { ssr: false });

const { defaultSourceChains, defaultTargetChains } = getLnBridgeCrossDefaultValue();
const bigintInputDefaultValue: InputValue<bigint> = { input: "", valid: true, value: 0n };
const numberInputDefaultValue: InputValue<number> = { input: "", valid: true, value: 0 };

export default function RelayerRegisterV3() {
  const {
    sourceChain,
    targetChain,
    sourceToken,
    sourceBalance,
    targetBalance,
    sourceAllowance,
    targetAllowance,
    setSourceChain,
    setTargetChain,
    setSourceToken,
    sourceApprove,
    targetApprove,
    depositPenaltyReserve,
    registerLnProvider,
    isLnBridgeExist,
  } = useRelayerV3();
  const [penaltyReserveInput, setPenaltyReserveInput] = useState(bigintInputDefaultValue);
  const [transferLimitInput, setTransferLimitInput] = useState(bigintInputDefaultValue);
  const [baseFeeInput, setBaseFeeInput] = useState(bigintInputDefaultValue);
  const [feeRateInput, setFeeRateInput] = useState(numberInputDefaultValue);
  const [currentStep, setCurrentStep] = useState(Step.ONE);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const { state: isOpen, setTrue: setIsOpenTrue, setFalse: setIsOpenFalse } = useToggle(false);

  const apolloClient = useApolloClient();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { openConnectModal } = useConnectModal();

  const handleRegister = useCallback(async () => {
    try {
      setIsRegistering(true);
      if (sourceChain?.id !== chain?.id) {
        switchNetwork?.(sourceChain?.id);
      } else if (await isLnBridgeExist(apolloClient)) {
        const receipt = await registerLnProvider(baseFeeInput.value, feeRateInput.value, transferLimitInput.value);
        setIsRegistered(receipt?.status === "success");
      }
    } catch (err) {
      console.error(err);
      notifyError(err);
    } finally {
      setIsRegistering(false);
    }
  }, [
    chain,
    apolloClient,
    sourceChain,
    baseFeeInput,
    feeRateInput,
    transferLimitInput,
    isLnBridgeExist,
    registerLnProvider,
    switchNetwork,
  ]);

  const handleDeposit = useCallback(async () => {
    try {
      setIsDepositing(true);
      if (sourceChain?.id !== chain?.id) {
        switchNetwork?.(sourceChain?.id);
      } else if (await isLnBridgeExist(apolloClient)) {
        if (sourceToken?.type !== "native" && penaltyReserveInput.value > (sourceAllowance?.value || 0n)) {
          await sourceApprove(penaltyReserveInput.value);
        } else {
          const receipt = await depositPenaltyReserve(penaltyReserveInput.value);
          if (receipt?.status === "success") {
            setCurrentStep(Step.THREE);
          }
        }
      }
    } catch (err) {
      console.error(err);
      notifyError(err);
    } finally {
      setIsDepositing(false);
    }
  }, [
    chain,
    apolloClient,
    sourceChain,
    sourceToken,
    sourceAllowance,
    penaltyReserveInput,
    depositPenaltyReserve,
    sourceApprove,
    isLnBridgeExist,
    switchNetwork,
  ]);

  const handleApproveMore = useCallback(async () => {
    try {
      setIsApproving(true);
      if (chain?.id !== targetChain?.id) {
        switchNetwork?.(targetChain?.id);
      } else {
        await targetApprove(targetBalance?.value || 0n);
      }
    } catch (err) {
      console.error(err);
      notifyError(err);
    } finally {
      setIsApproving(false);
    }
  }, [chain, targetChain, targetBalance, targetApprove, switchNetwork]);

  return (
    <>
      <div className="mx-auto flex w-full flex-col gap-5 lg:w-[38.75rem]">
        {/* Step 1 */}
        <div className="flex flex-col gap-5 rounded-large bg-component p-5 lg:p-[1.875rem]">
          <StepTitle step={1} title="Select Chain and Token" />
          <Divider />
          {currentStep === Step.ONE && (
            <>
              <div className="flex items-center gap-middle lg:gap-5">
                <Label text="From" className="flex-1">
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
                </Label>
                <Label text="To" className="flex-1">
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
                </Label>
              </div>
              <Label text="Token">
                <TokenSelect
                  className="bg-inner px-middle py-middle"
                  disabled={!getLnBridgeAvailableSourceTokens(sourceChain, targetChain).length}
                  options={getLnBridgeAvailableSourceTokens(sourceChain, targetChain)}
                  placeholder="Select token"
                  value={sourceToken}
                  onChange={setSourceToken}
                />
              </Label>
              <Divider />
              <Button
                onClick={() => {
                  address ? setCurrentStep(Step.ONE_SUMMARY) : openConnectModal?.();
                }}
                kind="primary"
                className="flex h-9 items-center justify-center rounded-middle"
                disabled={!sourceToken}
              >
                <span className="text-base font-normal text-white">{address ? "Confirm" : "Connect Wallet"}</span>
              </Button>
            </>
          )}
          {currentStep >= Step.ONE_SUMMARY && (
            <>
              <div className="flex items-center justify-between gap-small">
                <StepCompleteItem property="Address" address={address} />
                <StepCompleteItem property="Bridge Type" bridge="lnv3" />
                <StepCompleteItem property="From" chain={sourceChain} />
                <StepCompleteItem property="To" chain={targetChain} />
                <StepCompleteItem property="Token" token={sourceToken} />
              </div>
              <Divider />
              <div className="flex items-center gap-5">
                <Button
                  kind="default"
                  onClick={() => {
                    setCurrentStep(Step.ONE);
                    setSourceChain(undefined);
                    setTargetChain(undefined);
                    setSourceToken(undefined);
                    setPenaltyReserveInput(bigintInputDefaultValue);
                    setTransferLimitInput(bigintInputDefaultValue);
                    setBaseFeeInput(bigintInputDefaultValue);
                    setFeeRateInput(numberInputDefaultValue);
                    setIsRegistered(false);
                  }}
                  className="flex h-9 flex-1 items-center justify-center rounded-middle"
                >
                  <span className="text-base font-normal">Reset</span>
                </Button>
                <Button
                  kind="primary"
                  onClick={() => setCurrentStep(Step.TWO)}
                  className="flex h-9 flex-1 items-center justify-center rounded-middle"
                  disabled={currentStep !== Step.ONE_SUMMARY}
                >
                  <span className="text-base font-normal">Next</span>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-5 rounded-large bg-component p-5 lg:p-[1.875rem]">
          <StepTitle step={2} title="Deposit Penalty Reserve and Set Fee" />
          {currentStep === Step.TWO && (
            <>
              <Divider />
              <Label text="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction">
                <BalanceInput
                  compact
                  autoFocus
                  token={sourceToken}
                  suffix="symbol"
                  value={baseFeeInput}
                  onChange={setBaseFeeInput}
                />
              </Label>
              <Label
                text="Liquidity Fee Rate"
                tips="The percentage deducted by the relayer from the transfer amount in a transaction"
              >
                <FeeRateInput placeholder="Enter 0 ~ 0.25" value={feeRateInput} onChange={setFeeRateInput} />
              </Label>
              <Label text="Transfer Limit">
                <BalanceInput
                  compact
                  token={sourceToken}
                  suffix="symbol"
                  value={transferLimitInput}
                  onChange={setTransferLimitInput}
                />
              </Label>
              <Divider />
              {/* Register */}
              <Button
                kind="primary"
                disabled={
                  isRegistered ||
                  (sourceChain?.id === chain?.id &&
                    !(
                      baseFeeInput.input &&
                      baseFeeInput.valid &&
                      feeRateInput.input &&
                      feeRateInput.valid &&
                      transferLimitInput.input &&
                      transferLimitInput.valid &&
                      isValidFeeRate(feeRateInput.value)
                    ))
                }
                busy={isRegistering}
                className="flex h-9 items-center justify-center rounded-middle"
                onClick={handleRegister}
              >
                <span className="text-base font-normal">
                  {sourceChain?.id !== chain?.id ? "Switch Network" : "Confirm"}
                </span>
              </Button>
              <Label text="Deposit Penalty Reserve">
                <BalanceInput
                  compact
                  balance={sourceBalance?.value}
                  token={sourceBalance?.token}
                  value={penaltyReserveInput}
                  suffix="symbol"
                  onChange={setPenaltyReserveInput}
                />
              </Label>
              {/* Deposit */}
              <Button
                kind="primary"
                className="flex h-9 items-center justify-center rounded-middle"
                disabled={
                  !isRegistered ||
                  (sourceChain?.id === chain?.id && !(penaltyReserveInput.input && penaltyReserveInput.valid))
                }
                busy={isDepositing}
                onClick={handleDeposit}
              >
                <span className="text-base font-normal">
                  {isRegistered && sourceChain?.id !== chain?.id
                    ? "Switch Network"
                    : sourceToken?.type !== "native" && penaltyReserveInput.value > (sourceAllowance?.value || 0n)
                    ? "Approve"
                    : "Confirm"}
                </span>
              </Button>
            </>
          )}
          {currentStep >= Step.TWO_SUMMARY && (
            <>
              <Divider />
              <div className="flex items-center justify-between gap-small">
                <StepCompleteItem property="Transfer Limit" token={sourceToken} balance={transferLimitInput.value} />
                <StepCompleteItem property="Penalty Reserve" token={sourceToken} balance={penaltyReserveInput.value} />
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
              <Label text="Current Allowance">
                <BalanceInput
                  token={targetAllowance?.token}
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
              </Label>
              <div className="flex items-center gap-middle lg:gap-5">
                <Button
                  kind="primary"
                  onClick={handleApproveMore}
                  className="flex h-9 flex-1 items-center justify-center rounded-middle"
                  busy={isApproving}
                  disabled={sourceToken?.type === "native"}
                >
                  <span className="text-base font-normal">
                    {chain?.id === targetChain?.id ? "Approve More" : "Switch Network"}
                  </span>
                </Button>
                <Button
                  kind="default"
                  onClick={setIsOpenTrue}
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
        onClose={setIsOpenFalse}
      >
        <div
          className="grid items-center gap-x-small gap-y-5 text-sm font-normal text-white"
          style={{ gridTemplateColumns: "130px auto" }}
        >
          <span className="text-sm font-medium text-white">Address</span>
          {address ? <PrettyAddress address={address} /> : null}

          <span className="text-sm font-medium text-white">Bridge Type</span>
          <span>LnBridgeV3</span>

          <span className="text-sm font-medium text-white">From</span>
          <PrettyChain chain={sourceChain} />

          <span className="text-sm font-medium text-white">To</span>
          <PrettyChain chain={targetChain} />

          <span className="text-sm font-medium text-white">Token</span>
          <PrettyToken token={sourceToken} />

          <span className="text-sm font-medium text-white">Penalty Reserve</span>
          <PrettyBalance amount={penaltyReserveInput.value} token={sourceToken} />

          <span className="text-sm font-medium text-white">Transfer Limit</span>
          <PrettyBalance amount={transferLimitInput.value} token={sourceToken} />

          <span className="text-sm font-medium text-white">Base Fee</span>
          <PrettyBalance amount={baseFeeInput.value} token={sourceToken} />

          <span className="text-sm font-medium text-white">Liquidity Fee Rate</span>
          <span>{formatFeeRate(feeRateInput.value)}%</span>
        </div>
        <Divider />
        <div className="flex items-center gap-middle lg:gap-5">
          <RunRelayer style="button" />
          <Button
            kind="default"
            onClick={() => {
              setIsOpenFalse();
              setCurrentStep(Step.ONE);
              setSourceChain(undefined);
              setTargetChain(undefined);
              setSourceToken(undefined);
              setPenaltyReserveInput(bigintInputDefaultValue);
              setTransferLimitInput(bigintInputDefaultValue);
              setBaseFeeInput(bigintInputDefaultValue);
              setFeeRateInput(numberInputDefaultValue);
              setIsRegistered(false);
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

function Label({
  children,
  text,
  tips,
  className,
}: PropsWithChildren<{ text: string; tips?: string; className?: string }>) {
  return (
    <div className={`flex flex-col gap-middle ${className}`}>
      <div className="flex items-center gap-small">
        <span className="text-sm font-extrabold text-white">{text}</span>
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

function PrettyBalance({ token, amount }: { token?: Token; amount: bigint }) {
  return <span>{token ? formatBalance(amount, token.decimals) : ""}</span>;
}

function Divider() {
  return <div className="h-[1px] bg-white/10" />;
}
