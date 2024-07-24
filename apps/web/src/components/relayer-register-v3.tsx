import { useRelayerV3, useToggle } from "../hooks";
import { ChainConfig, InputValue, Token } from "../types";
import StepTitle from "../ui/step-title";
import Tooltip from "../ui/tooltip";
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
} from "../utils";
import { useApolloClient } from "@apollo/client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, useCallback, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import ChainSelect from "./chain-select";
import TokenSelect from "./token-select";
import Button from "../ui/button";
import StepCompleteItem from "./step-complete-item";
import { BalanceInput } from "./balance-input";
import FeeRateInput from "./fee-rate-input";
import PrettyAddress from "./pretty-address";
import Modal from "../ui/modal";

enum Step {
  ONE,
  ONE_OVERVIEW,
  TWO,
  TWO_OVERVIEW,
  THREE,
}

const { defaultSourceChains, defaultTargetChains } = getLnBridgeCrossDefaultValue();
const bigintInputDefaultValue: InputValue<bigint> = { input: "", valid: true, value: 0n };
const numberInputDefaultValue: InputValue<number> = { input: "", valid: true, value: 0 };

export default function RelayerRegisterV3({ onManage = () => undefined }: { onManage?: () => void }) {
  const {
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
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
            if (targetToken?.type && targetToken?.type !== "native") {
              setCurrentStep(Step.THREE);
            } else {
              setIsOpenTrue();
            }
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
    targetToken,
    sourceAllowance,
    penaltyReserveInput,
    depositPenaltyReserve,
    sourceApprove,
    isLnBridgeExist,
    switchNetwork,
    setIsOpenTrue,
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
      <div className="mx-auto flex w-full flex-col gap-5 lg:w-[40rem]">
        {/* Step 1 */}
        <div className="flex flex-col gap-5 rounded-3xl bg-[#1F282C] p-5 lg:p-8">
          <StepTitle step={1} title="Select Chain and Token" />
          <Divider />
          {Step.ONE === currentStep && (
            <>
              <div className="gap-medium flex items-center lg:gap-5">
                <Label text="From" className="flex-1">
                  <ChainSelect
                    className="bg-app-bg px-medium h-10 rounded-xl lg:h-11"
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
                    className="bg-app-bg px-medium h-10 rounded-xl lg:h-11"
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
                  disabled={!getLnBridgeAvailableSourceTokens(sourceChain, targetChain).length}
                  options={getLnBridgeAvailableSourceTokens(sourceChain, targetChain)}
                  placeholder="Select a token"
                  value={sourceToken}
                  onChange={setSourceToken}
                />
              </Label>
              <Divider />
              <Button
                onClick={() => {
                  address ? setCurrentStep(Step.TWO) : openConnectModal?.();
                }}
                kind="primary"
                className="inline-flex h-11 items-center justify-center rounded-full"
                disabled={!sourceToken}
              >
                <span className="text-sm font-semibold text-white">{address ? "Next" : "Connect Wallet"}</span>
              </Button>
            </>
          )}
          {Step.ONE_OVERVIEW <= currentStep && (
            <>
              <div className="gap-small flex items-center justify-between">
                <StepCompleteItem property="Address" address={address} className="hidden lg:flex" />
                <StepCompleteItem property="Bridge Type" bridge="lnv3" className="hidden lg:flex" />
                <StepCompleteItem property="From" chain={sourceChain} />
                <StepCompleteItem property="To" chain={targetChain} />
                <StepCompleteItem property="Token" token={sourceToken} />
              </div>
              <Divider />
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
                className="inline-flex h-11 items-center justify-center rounded-full"
              >
                <span className="text-sm font-semibold text-white">Reset</span>
              </Button>
            </>
          )}
        </div>

        {/* Step 2 */}
        <div className="flex flex-col gap-5 rounded-3xl bg-[#1F282C] p-5 lg:p-8">
          <StepTitle step={2} title="Deposit Penalty Reserve and Set Fee" />
          {Step.TWO === currentStep && (
            <>
              <Divider />
              <Label text="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction">
                <BalanceInput token={sourceToken} value={baseFeeInput} onChange={setBaseFeeInput} />
              </Label>
              <Label
                text="Liquidity Fee Rate"
                tips="The percentage deducted by the relayer from the transfer amount in a transaction"
              >
                <FeeRateInput
                  isV3
                  placeholder="Enter 0 ~ 100"
                  className="bg-app-bg px-medium h-10 rounded-xl text-sm font-semibold text-white lg:h-11"
                  value={feeRateInput}
                  onChange={setFeeRateInput}
                />
              </Label>
              <Label text="Transfer Limit">
                <BalanceInput token={sourceToken} value={transferLimitInput} onChange={setTransferLimitInput} />
              </Label>
              <Divider />
              {/* Register */}
              <Button
                kind={isRegistered ? "default" : "primary"}
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
                      isValidFeeRate(feeRateInput.value, true)
                    ))
                }
                busy={isRegistering}
                className="inline-flex h-11 items-center justify-center rounded-full"
                onClick={handleRegister}
              >
                <span className="text-sm font-semibold text-white">
                  {sourceChain?.id !== chain?.id ? "Switch Network" : "Register"}
                </span>
              </Button>
              <Label text="Deposit Penalty Reserve">
                <BalanceInput
                  balance={sourceBalance?.value}
                  token={sourceBalance?.token}
                  value={penaltyReserveInput}
                  onChange={setPenaltyReserveInput}
                />
              </Label>
              {/* Deposit */}
              <Button
                kind={isRegistered ? "primary" : "default"}
                className="inline-flex h-11 items-center justify-center rounded-full"
                disabled={
                  !isRegistered ||
                  (sourceChain?.id === chain?.id && !(penaltyReserveInput.input && penaltyReserveInput.valid))
                }
                busy={isDepositing}
                onClick={handleDeposit}
              >
                <span className="text-sm font-semibold text-white">
                  {isRegistered && sourceChain?.id !== chain?.id
                    ? "Switch Network"
                    : sourceToken?.type !== "native" && penaltyReserveInput.value > (sourceAllowance?.value || 0n)
                      ? "Approve"
                      : "Deposit"}
                </span>
              </Button>
            </>
          )}
          {Step.TWO_OVERVIEW <= currentStep && (
            <>
              <Divider />
              <div className="gap-small flex items-center justify-between">
                <StepCompleteItem property="Transfer Limit" token={sourceToken} balance={transferLimitInput.value} />
                <StepCompleteItem property="Penalty Reserve" token={sourceToken} balance={penaltyReserveInput.value} />
                <StepCompleteItem property="Base Fee" token={sourceToken} balance={baseFeeInput.value} />
                <StepCompleteItem property="Liquidity Fee Rate" percent={formatFeeRate(feeRateInput.value)} />
              </div>
            </>
          )}
        </div>
        {/* Step 3 */}
        {targetToken?.type && targetToken.type !== "native" ? (
          <div className="flex flex-col gap-5 rounded-3xl bg-[#1F282C] p-5 lg:p-8">
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
                    placeholder="-"
                  />
                </Label>
                <div className="gap-medium flex items-center lg:gap-5">
                  <Button
                    kind="default"
                    onClick={setIsOpenTrue}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full"
                  >
                    <span className="text-sm font-semibold text-white">Skip</span>
                  </Button>
                  <Button
                    kind="primary"
                    onClick={handleApproveMore}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full"
                    busy={isApproving}
                    disabled={sourceToken?.type === "native"}
                  >
                    <span className="text-sm font-semibold text-white">
                      {chain?.id === targetChain?.id ? "Approve More" : "Switch Network"}
                    </span>
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <Modal
        title="One More Step!"
        subTitle={
          <div className="flex flex-wrap items-center text-sm font-semibold text-white">
            Now&nbsp;
            <RunRelayer style="link" />
            &nbsp;to start relaying messages and earn rewards.
          </div>
        }
        isOpen={isOpen}
        onClose={setIsOpenFalse}
      >
        <div
          className="gap-x-small grid items-center gap-y-5 text-sm font-semibold text-white"
          style={{ gridTemplateColumns: "130px auto" }}
        >
          <span className="text-white/50">Address</span>
          {address ? <PrettyAddress address={address} /> : null}

          <span className="text-white/50">Bridge Type</span>
          <span>LnBridgeV3</span>

          <span className="text-white/50">From</span>
          <PrettyChain chain={sourceChain} />

          <span className="text-white/50">To</span>
          <PrettyChain chain={targetChain} />

          <span className="text-white/50">Token</span>
          <PrettyToken token={sourceToken} />

          <span className="text-white/50">Penalty Reserve</span>
          <PrettyBalance amount={penaltyReserveInput.value} token={sourceToken} />

          <span className="text-white/50">Transfer Limit</span>
          <PrettyBalance amount={transferLimitInput.value} token={sourceToken} />

          <span className="text-white/50">Base Fee</span>
          <PrettyBalance amount={baseFeeInput.value} token={sourceToken} />

          <span className="text-white/50">Liquidity Fee Rate</span>
          <span>{formatFeeRate(feeRateInput.value)}%</span>
        </div>
        <Divider />
        <div className="gap-medium flex items-center lg:gap-5">
          <Button
            kind="default"
            onClick={onManage}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-full lg:h-11"
          >
            <span className="text-sm font-semibold text-white">Manage</span>
          </Button>
          <RunRelayer style="button" />
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
          ? `bg-primary h-10 flex-1 items-center justify-center rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-80 lg:h-11`
          : "text-primary text-sm font-semibold hover:underline"
      }`}
      rel="noopener"
      target="_blank"
      onClick={onClick}
    >
      {style === "button" ? "Run relayer" : "run a relayer"}
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
    <div className={`gap-medium flex flex-col ${className}`}>
      <div className="gap-small flex items-center">
        <span className="text-sm font-semibold text-white/50">{text}</span>
        {tips ? (
          <Tooltip content={tips} className="w-fit" contentClassName="max-w-[20rem]">
            <img width={16} height={16} alt="Info" src="images/info.svg" />
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
    <div className="gap-small flex items-center">
      <img width={22} height={22} alt="Chain" src={getChainLogoSrc(chain.logo)} className="shrink-0 rounded-full" />
      <span>{chain.name}</span>
    </div>
  ) : (
    ""
  );
}

function PrettyToken({ token }: { token?: Token }) {
  return token ? (
    <div className="gap-small flex items-center">
      <img width={22} height={22} alt="Chain" src={getTokenLogoSrc(token.logo)} className="shrink-0 rounded-full" />
      <span>{token.symbol}</span>
    </div>
  ) : (
    ""
  );
}

function PrettyBalance({ token, amount }: { token?: Token; amount: bigint }) {
  return <span>{token ? `${formatBalance(amount, token.decimals, { precision: 6 })} ${token.symbol}` : ""}</span>;
}

function Divider() {
  return <div className="h-[1px] bg-white/10" />;
}
