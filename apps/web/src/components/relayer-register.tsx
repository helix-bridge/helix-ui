import { GQL_QUERY_LNBRIDGE_RELAY_INFOS } from "../config";
import { useRelayer } from "../hooks";
import {
  BridgeCategory,
  ChainConfig,
  InputValue,
  QueryLnBridgeRelayInfosReqParams,
  QueryLnBridgeRelayInfosResData,
  Token,
} from "../types";
import { notification } from "../ui/notification";
import StepTitle from "../ui/step-title";
import Tooltip from "../ui/tooltip";
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
} from "../utils";
import { useApolloClient } from "@apollo/client";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { Address, useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import ChainSelect from "./chain-select";
import TokenSelect from "./token-select";
import Button from "../ui/button";
import StepCompleteItem from "./step-complete-item";
import { BalanceInput } from "./balance-input";
import FeeRateInput from "./fee-rate-input";
import { TransactionReceipt } from "viem";
import PrettyAddress from "./pretty-address";
import Modal from "../ui/modal";

enum Step {
  ONE,
  ONE_OVERVIEW,
  TWO,
  TWO_OVERVIEW,
  THREE,
}

const { defaultSourceChains, defaultTargetChains } = getLnBridgeCrossDefaultValue(true);

export default function RelayerRegister({ onManage = () => undefined }: { onManage?: () => void }) {
  const {
    sourceChain,
    targetChain,
    sourceToken,
    targetToken,
    sourceAllowance,
    sourceBalance,
    targetAllowance,
    targetBalance,
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
        QueryLnBridgeRelayInfosResData,
        QueryLnBridgeRelayInfosReqParams
      >({
        query: GQL_QUERY_LNBRIDGE_RELAY_INFOS,
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
        relayerData.queryLnBridgeRelayInfos?.records.some(
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
      <div className="mx-auto flex w-full flex-col gap-5 lg:w-[40rem]">
        {/* Step 1 */}
        <div className="flex flex-col gap-5 rounded-3xl bg-[#1F282C] p-5 lg:p-8">
          <StepTitle step={1} title="Select Chain and Token" />

          {Step.ONE === currentStep && (
            <>
              <Description content="Different source chains and target chains correspond to different bridge types. In different bridge types, the relayer is required to set margin on different chains. When the bridge type is 'default', the relayer needs to set margin on the target chain. If the bridge type is 'opposite', the relayer must set margin on the source chain." />

              <Divider />

              <div className="gap-medium flex items-center lg:gap-5">
                <LabelItem label="From" className="flex-1">
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
                </LabelItem>
                <LabelItem label="To" className="flex-1">
                  <ChainSelect
                    className="bg-app-bg px-medium h-10 rounded-xl lg:h-11"
                    options={getLnBridgeAvailableTargetChains(sourceChain, defaultTargetChains, true)}
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
                  disabled={!getLnBridgeAvailableSourceTokens(sourceChain, targetChain, [], true).length}
                  options={getLnBridgeAvailableSourceTokens(sourceChain, targetChain, [], true)}
                  placeholder="Select a token"
                  value={sourceToken}
                  onChange={setSourceToken}
                />
              </LabelItem>

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
              <Divider />

              <div className="gap-small flex items-center justify-between">
                <StepCompleteItem property="Address" address={address} className="hidden lg:flex" />
                <StepCompleteItem
                  property="Bridge Type"
                  bridge={oppositeBridge ? "lnv2-opposite" : "lnv2-default"}
                  className="hidden lg:flex"
                />
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
                  setMarginInput({ input: "", valid: true, value: 0n });
                  setBaseFeeInput({ input: "", valid: true, value: 0n });
                  setFeeRateInput({ input: "", valid: true, value: 0 });
                  setCompleteMargin(false);
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
          <StepTitle step={2} title="Deposit Margin and Set Fee" />

          {Step.TWO === currentStep && (
            <>
              <Description content="When a relayer engages in misconduct, their margin will be used for compensation. The fee charged by the relayer in the source chain from user transactions is baseFee + transferAmount * liquidityFeeRate." />

              <Divider />

              <LabelItem label="Deposit Margin">
                <BalanceInput
                  balance={defaultBridge ? targetBalance?.value : sourceBalance?.value}
                  token={defaultBridge ? targetBalance?.token : sourceBalance?.token}
                  value={marginInput}
                  disabled={completeMargin}
                  onChange={setMarginInput}
                />
              </LabelItem>

              {defaultBridge ? (
                <>
                  <Button
                    kind={completeMargin ? "default" : "primary"}
                    className="inline-flex h-11 items-center justify-center rounded-full"
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
                            if (!(await isRegistered(address, sourceChain, targetChain, sourceToken, "lnv2-default"))) {
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
                    <span className="text-sm font-semibold text-white">
                      {!completeMargin && targetChain?.id !== chain?.id
                        ? "Switch Network"
                        : !completeMargin &&
                            targetToken?.type !== "native" &&
                            marginInput.value > (targetAllowance?.value || 0n)
                          ? "Approve"
                          : "Deposit"}
                    </span>
                  </Button>
                  <Divider />
                </>
              ) : null}

              <LabelItem label="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction">
                <BalanceInput token={sourceToken} value={baseFeeInput} onChange={setBaseFeeInput} />
              </LabelItem>
              <LabelItem
                label="Liquidity Fee Rate"
                tips="The percentage deducted by the relayer from the transfer amount in a transaction"
              >
                <FeeRateInput
                  placeholder="Enter 0 ~ 0.25"
                  className="bg-app-bg px-medium h-10 rounded-xl text-sm font-semibold text-white lg:h-11"
                  value={feeRateInput}
                  onChange={setFeeRateInput}
                />
              </LabelItem>

              <Divider />

              <Button
                kind={completeMargin ? "primary" : "default"}
                disabled={
                  sourceChain?.id === chain?.id &&
                  !(marginInput.input && baseFeeInput.input && feeRateInput.input && isValidFeeRate(feeRateInput.value))
                }
                busy={busy}
                className="inline-flex h-11 items-center justify-center rounded-full"
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
                        marginInput.value > (sourceAllowance?.value || 0n)
                      ) {
                        await sourceApprove(address, marginInput.value, oppositeBridge, sourceChain);
                      } else if (defaultBridge) {
                        receipt = await setFeeAndRate(
                          baseFeeInput.value,
                          feeRateInput.value,
                          defaultBridge,
                          sourceChain,
                        );
                      } else if (
                        oppositeBridge &&
                        (await isLnBridgeExist(apolloClient, sourceChain, targetChain, sourceToken, targetToken))
                      ) {
                        if (!(await isRegistered(address, sourceChain, targetChain, sourceToken, "lnv2-opposite"))) {
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
                        if (targetToken.type && targetToken.type !== "native") {
                          setCurrentStep(Step.THREE);
                        } else {
                          setIsOpen(true);
                        }
                      }
                    }
                  }
                }}
              >
                <span className="text-sm font-semibold text-white">
                  {defaultBridge
                    ? sourceChain?.id !== chain?.id
                      ? "Switch Network"
                      : "Register"
                    : oppositeBridge
                      ? sourceChain?.id !== chain?.id
                        ? "Switch Network"
                        : sourceToken?.type !== "native" && marginInput.value > (sourceAllowance?.value || 0n)
                          ? "Approve"
                          : "Register"
                      : "Register"}
                </span>
              </Button>
            </>
          )}
          {Step.TWO_OVERVIEW <= currentStep && (
            <>
              <Divider />
              <div className="gap-small flex items-center justify-between">
                <StepCompleteItem
                  property="Margin"
                  token={defaultBridge ? targetToken : oppositeBridge ? sourceToken : undefined}
                  balance={marginInput.value}
                />
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

                <LabelItem label="Current Allowance">
                  <BalanceInput
                    token={targetToken}
                    disabled
                    value={{
                      value: targetAllowance?.value ?? 0n,
                      input: formatBalance(targetAllowance?.value ?? 0n, targetAllowance?.token.decimals ?? 0),
                      valid: true,
                    }}
                    placeholder="-"
                  />
                </LabelItem>

                <div className="gap-medium flex items-center lg:gap-5">
                  <Button
                    kind="default"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full"
                  >
                    <span className="text-sm font-semibold text-white">Skip</span>
                  </Button>
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
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full"
                    busy={busy}
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
        onClose={() => setIsOpen(false)}
      >
        <div
          className="gap-x-small grid items-center gap-y-5 text-sm font-semibold text-white"
          style={{ gridTemplateColumns: "130px auto" }}
        >
          <span className="text-white/50">Address</span>
          {address ? <PrettyAddress address={address} /> : null}

          <span className="text-white/50">Bridge Type</span>
          <span>{defaultBridge ? "Default" : oppositeBridge ? "Opposite" : "-"}</span>

          <span className="text-white/50">From</span>
          <PrettyChain chain={sourceChain} />

          <span className="text-white/50">To</span>
          <PrettyChain chain={targetChain} />

          <span className="text-white/50">Token</span>
          <PrettyToken token={sourceToken} />

          <span className="text-white/50">Margin</span>
          <PrettyMargin margin={marginInput.value} token={defaultBridge ? targetToken : sourceToken} />

          <span className="text-white/50">Base Fee</span>
          <PrettyBaseFee fee={baseFeeInput.value} token={sourceToken} />

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
            <span className="text-sm font-semibold">Manage</span>
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
          ? `border-radius bg-primary h-10 flex-1 items-center justify-center rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-80 lg:h-11`
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

function LabelItem({
  children,
  label,
  tips,
  className,
}: PropsWithChildren<{ label: string; tips?: string; className?: string }>) {
  return (
    <div className={`gap-medium flex flex-col ${className}`}>
      <div className="gap-small flex items-center">
        <span className="text-sm font-semibold text-white/50">{label}</span>
        {tips ? (
          <Tooltip content={tips} className="w-fit" contentClassName="max-w-[18rem]">
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

function PrettyMargin({ token, margin }: { token?: Token; margin: bigint }) {
  return <span>{token ? `${formatBalance(margin, token.decimals)} ${token.symbol}` : ""}</span>;
}

function PrettyBaseFee({ fee, token }: { fee: bigint; token?: Token }) {
  return <span>{token ? `${formatBalance(fee, token.decimals)} ${token.symbol}` : ""}</span>;
}

function Divider() {
  return <div className="h-[1px] bg-white/10" />;
}
