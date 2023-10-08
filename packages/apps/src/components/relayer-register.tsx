"use client";

import Button from "@/ui/button";
import { Divider } from "@/ui/divider";
import StepNumber from "@/ui/step-number";
import { PropsWithChildren, useEffect, useState } from "react";
import ChainSelect from "./chain-select";
import TokenSelect from "./token-select";
import { Network } from "@/types/chain";
import { TokenSymbol } from "@/types/token";
import { BridgeCategory } from "@/types/bridge";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import Image from "next/image";
import { getChainLogoSrc, getTokenLogoSrc } from "@/utils/misc";
import Tooltip from "@/ui/tooltip";
import StepCompleteItem from "./step-complete-item";
import { BalanceInput, BalanceInputValue } from "./balance-input";
import PrettyAddress from "./pretty-address";
import LiquidityFeeRateInput from "./liquidity-fee-rate-input";
import { getParsedCrossChain } from "@/utils/cross-chain";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { fetchBalance } from "wagmi/actions";
import { Subscription, forkJoin, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { getChainConfig } from "@/utils/chain";
import { formatBalance } from "@/utils/balance";
import { useApolloClient } from "@apollo/client";
import { QUERY_SPECIAL_RELAYER } from "@/config/gql";
import { SpecialRelayerResponseData, SpecialRelayerVariables } from "@/types/graphql";
import { notification } from "@/ui/notification";
import { bridgeFactory } from "@/utils/bridge";

enum Step {
  ONE,
  COMPLETE_ONE,
  TWO,
  COMPLETE_TWO,
  THREE,
  COMPLETE_THREE,
}

const { availableTargetChains, defaultTargetChains, availableBridges, defaultSourceOptions } = getParsedCrossChain();

export default function RelayerRegister() {
  const [defaultMarginBusy, setDefaultMarginBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [completeMargin, setCompleteMargin] = useState(false);
  const [balance, setBalance] = useState<bigint>();
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [depositMargin, setDepositMargin] = useState<BalanceInputValue>({ formatted: 0n, value: "" });
  const [baseFee, setBaseFee] = useState<BalanceInputValue>({ formatted: 0n, value: "" });
  const [feeRate, setFeeRate] = useState<{ formatted: number; value: string }>({ formatted: 0, value: "" });
  const [currentStep, setCurrentStep] = useState(Step.ONE);
  const [sourceChain, setSourceChain] = useState<Network>();
  const [targetChain, setTargetChain] = useState<Network>();
  const [activeToken, setActiveToken] = useState<TokenSymbol>();
  const [tokenOptions, setTokenOptions] = useState<TokenSymbol[]>([]);
  const [bridgeCategory, setBridgeCategory] = useState<BridgeCategory>();

  const apolloClient = useApolloClient();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    const availableCategories = new Set<BridgeCategory>();
    const availableTokens = new Set<TokenSymbol>();

    if (sourceChain && targetChain) {
      (Object.keys(availableBridges[sourceChain]?.[targetChain] || {}) as TokenSymbol[]).forEach((symbol) => {
        availableBridges[sourceChain]?.[targetChain]?.[symbol]?.forEach((category) => {
          if (category === "lnbridgev20-default" || category === "lnbridgev20-opposite") {
            availableCategories.add(category);
            availableTokens.add(symbol);
          }
        });
      });
    }

    setBridgeCategory(Array.from(availableCategories).at(0));
    setTokenOptions(Array.from(availableTokens));
  }, [sourceChain, targetChain]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && sourceChain && targetChain && activeToken && bridgeCategory) {
      const bridgeContract = bridgeFactory({ category: bridgeCategory })?.getInfo().contract;

      if (bridgeCategory === "lnbridgev20-default" && chain?.id === getChainConfig(targetChain)?.id && bridgeContract) {
        const tokenConfig = getChainConfig(targetChain)?.tokens.find((t) => t.symbol === activeToken);

        if (tokenConfig) {
          sub$$ = from(import("@/abi/erc20.json"))
            .pipe(
              switchMap((abi) =>
                forkJoin([
                  fetchBalance({ address, token: tokenConfig.address }),
                  publicClient.readContract({
                    address: tokenConfig.address,
                    abi: abi.default,
                    functionName: "allowance",
                    args: [address, bridgeContract.targetAddress],
                  }),
                ]),
              ),
            )
            .subscribe({
              next: ([b, a]) => {
                setBalance(b.value);
                setAllowance(a as unknown as bigint);
              },
              error: (err) => {
                console.error(err);
                setBalance(undefined);
                setAllowance(0n);
              },
            });
        }
      } else if (
        bridgeCategory === "lnbridgev20-opposite" &&
        chain?.id === getChainConfig(sourceChain)?.id &&
        bridgeContract
      ) {
        const tokenConfig = getChainConfig(sourceChain)?.tokens.find((t) => t.symbol === activeToken);

        if (tokenConfig) {
          sub$$ = from(import("@/abi/erc20.json"))
            .pipe(
              switchMap((abi) =>
                forkJoin([
                  fetchBalance({ address, token: tokenConfig.address }),
                  publicClient.readContract({
                    address: tokenConfig.address,
                    abi: abi.default,
                    functionName: "allowance",
                    args: [address, bridgeContract.sourceAddress],
                  }),
                ]),
              ),
            )
            .subscribe({
              next: ([b, a]) => {
                setBalance(b.value);
                setAllowance(a as unknown as bigint);
              },
              error: (err) => {
                console.error(err);
                setBalance(undefined);
                setAllowance(0n);
              },
            });
        }
      } else {
        setBalance(undefined);
        setAllowance(0n);
      }
    } else {
      setBalance(undefined);
      setAllowance(0n);
    }

    return () => sub$$?.unsubscribe();
  }, [chain, address, sourceChain, targetChain, bridgeCategory, activeToken, publicClient]);

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
                    className="px-middle bg-app-bg hover:border-line border-transparent py-2"
                    options={defaultSourceOptions.map(({ network }) => network)}
                    placeholder="Source chain"
                    onChange={(value) => {
                      setSourceChain(value);
                      setTargetChain(undefined);
                      setActiveToken(undefined);
                    }}
                    value={sourceChain}
                  />
                </LabelItem>
                <LabelItem label="To" className="flex-1">
                  <ChainSelect
                    className="px-middle bg-app-bg hover:border-line border-transparent py-2"
                    options={sourceChain ? availableTargetChains[sourceChain] || [] : defaultTargetChains}
                    placeholder="Target chain"
                    onChange={(value) => {
                      setTargetChain(value);
                      setActiveToken(undefined);
                    }}
                    value={targetChain}
                  />
                </LabelItem>
              </div>

              <LabelItem label="Token">
                <TokenSelect
                  className="px-middle py-2"
                  disabled={!tokenOptions.length}
                  options={tokenOptions}
                  placeholder="Select token"
                  onChange={setActiveToken}
                  value={activeToken}
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
                disabled={!activeToken}
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
                {/* <StepCompleteItem property="Bridge Type" bridge={bridgeCategory} /> */}
                <StepCompleteItem property="From" network={sourceChain} />
                <StepCompleteItem property="To" network={targetChain} />
                {sourceChain && activeToken ? (
                  <StepCompleteItem property="Token" chainToken={{ network: sourceChain, symbol: activeToken }} />
                ) : null}
              </div>

              <Divider />

              <div className="flex items-center gap-5">
                <Button
                  kind="default"
                  onClick={() => {
                    setSourceChain(undefined);
                    setTargetChain(undefined);
                    setActiveToken(undefined);
                    setCurrentStep(Step.ONE);
                    setCompleteMargin(false);
                  }}
                  className="flex h-9 flex-1 items-center justify-center"
                >
                  <span className="text-sm font-medium text-white">Reset</span>
                </Button>
                <Button
                  kind="primary"
                  onClick={() => setCurrentStep(Step.TWO)}
                  className="flex h-9 flex-1 items-center justify-center"
                  disabled={Step.COMPLETE_ONE !== currentStep}
                >
                  <span className="text-sm font-medium text-white">Next</span>
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
                  balance={balance}
                  chainToken={
                    bridgeCategory === "lnbridgev20-default" && targetChain && activeToken
                      ? { network: targetChain, symbol: activeToken }
                      : bridgeCategory === "lnbridgev20-opposite" && sourceChain && activeToken
                      ? { network: sourceChain, symbol: activeToken }
                      : undefined
                  }
                  value={depositMargin}
                  disabled={completeMargin}
                  onChange={setDepositMargin}
                />
              </LabelItem>

              {bridgeCategory === "lnbridgev20-default" && (
                <>
                  <Button
                    kind="primary"
                    onClick={async () => {
                      if (sourceChain && targetChain && bridgeCategory && address) {
                        const sourceSymbol = activeToken;
                        const sourceChainConfig = getChainConfig(sourceChain);
                        const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === sourceSymbol);

                        const cross = sourceTokenConfig?.cross.find(
                          (c) => c.bridge.category === bridgeCategory && c.target.network === targetChain,
                        );
                        const bridgeContract = bridgeFactory({ category: bridgeCategory })?.getInfo().contract;

                        const targetSymbol = cross?.target.symbol;
                        const targetChainConfig = getChainConfig(targetChain);
                        const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === targetSymbol);

                        if (targetChainConfig?.id !== chain?.id) {
                          switchNetwork?.(targetChainConfig?.id);
                        } else if (depositMargin.formatted > allowance) {
                          if (targetTokenConfig && bridgeContract && walletClient) {
                            try {
                              setDefaultMarginBusy(true);

                              const { data: relayerData } = await apolloClient.query<
                                SpecialRelayerResponseData,
                                SpecialRelayerVariables
                              >({
                                query: QUERY_SPECIAL_RELAYER,
                                variables: {
                                  fromChain: sourceChain,
                                  toChain: targetChain,
                                  bridge: bridgeCategory,
                                  relayer: address.toLowerCase(),
                                },
                                fetchPolicy: "no-cache",
                              });
                              if (relayerData.queryLnv20RelayInfos?.total) {
                                notification.warn({
                                  title: "Transaction failed",
                                  description: `You have registered a relayer that supports this cross-chain.`,
                                });
                                return;
                              }

                              const abi = (await import("../abi/erc20.json")).default;
                              const spender = bridgeContract.targetAddress;

                              const { request } = await publicClient.simulateContract({
                                address: targetTokenConfig.address,
                                abi,
                                functionName: "approve",
                                args: [spender, depositMargin.formatted],
                                account: address,
                              });
                              const hash = await walletClient.writeContract(request);
                              await publicClient.waitForTransactionReceipt({ hash });

                              setAllowance(
                                (await publicClient.readContract({
                                  address: targetTokenConfig.address,
                                  abi,
                                  functionName: "allowance",
                                  args: [address, spender],
                                })) as unknown as bigint,
                              );
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setDefaultMarginBusy(false);
                            }
                          }
                        } else if (
                          sourceChainConfig &&
                          sourceTokenConfig &&
                          targetTokenConfig &&
                          bridgeContract &&
                          walletClient
                        ) {
                          try {
                            setDefaultMarginBusy(true);

                            const { data: relayerData } = await apolloClient.query<
                              SpecialRelayerResponseData,
                              SpecialRelayerVariables
                            >({
                              query: QUERY_SPECIAL_RELAYER,
                              variables: {
                                fromChain: sourceChain,
                                toChain: targetChain,
                                bridge: bridgeCategory,
                                relayer: address.toLowerCase(),
                              },
                              fetchPolicy: "no-cache",
                            });
                            if (relayerData.queryLnv20RelayInfos?.total) {
                              notification.warn({
                                title: "Transaction failed",
                                description: `You have registered a relayer that supports this cross-chain.`,
                              });
                              return;
                            }

                            const abi = (await import("../abi/lnbridgev20-default.json")).default;
                            const hash = await walletClient.writeContract({
                              address: bridgeContract.targetAddress,
                              abi,
                              functionName: "depositProviderMargin",
                              args: [
                                BigInt(sourceChainConfig.id),
                                sourceTokenConfig.address,
                                targetTokenConfig.address,
                                depositMargin.formatted,
                              ],
                              value: sourceTokenConfig.type === "native" ? depositMargin.formatted : undefined,
                            });
                            const receipt = await publicClient.waitForTransactionReceipt({ hash });
                            if (receipt.status === "success") {
                              setCompleteMargin(true);
                            } else {
                              notification.error({
                                title: "Transaction failed",
                                description: <span className="break-all">{receipt.transactionHash}</span>,
                              });
                            }
                          } catch (err) {
                            console.error(err);
                            notification.error({ title: "Transaction failed", description: (err as Error).message });
                          } finally {
                            setDefaultMarginBusy(false);
                          }
                        }
                      }
                    }}
                    className="flex h-9 items-center justify-center"
                    disabled={
                      completeMargin ||
                      (getChainConfig(targetChain)?.id === chain?.id && depositMargin.formatted === 0n)
                    }
                    busy={defaultMarginBusy}
                  >
                    <span className="text-sm font-medium text-white">
                      {getChainConfig(targetChain)?.id !== chain?.id
                        ? "Switch Network"
                        : depositMargin.formatted > allowance
                        ? "Approve"
                        : "Confirm"}
                    </span>
                  </Button>
                  <Divider />
                </>
              )}

              <LabelItem label="Base Fee" tips="The fixed fee set by the relayer and charged in a transaction">
                <BalanceInput
                  chainToken={sourceChain && activeToken ? { network: sourceChain, symbol: activeToken } : undefined}
                  value={baseFee}
                  onChange={setBaseFee}
                />
              </LabelItem>
              <LabelItem
                label="Liquidity Fee Rate"
                tips="The percentage deducted by the relayer from the transfer amount in a transaction"
              >
                <LiquidityFeeRateInput placeholder="Enter 0 ~ 100" value={feeRate} onChange={setFeeRate} />
              </LabelItem>

              <Divider />

              <Button
                kind="primary"
                onClick={async () => {
                  if (sourceChain && targetChain && bridgeCategory && address) {
                    const sourceSymbol = activeToken;
                    const sourceChainConfig = getChainConfig(sourceChain);
                    const sourceTokenConfig = sourceChainConfig?.tokens.find((t) => t.symbol === sourceSymbol);

                    const cross = sourceTokenConfig?.cross.find(
                      (c) => c.bridge.category === bridgeCategory && c.target.network === targetChain,
                    );
                    const bridgeContract = bridgeFactory({ category: bridgeCategory })?.getInfo().contract;

                    const targetSymbol = cross?.target.symbol;
                    const targetChainConfig = getChainConfig(targetChain);
                    const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === targetSymbol);

                    if (sourceChainConfig?.id !== chain?.id) {
                      switchNetwork?.(sourceChainConfig?.id);
                    } else if (bridgeCategory === "lnbridgev20-opposite" && depositMargin.formatted > allowance) {
                      if (sourceTokenConfig && bridgeContract && walletClient) {
                        try {
                          setBusy(true);

                          const { data: relayerData } = await apolloClient.query<
                            SpecialRelayerResponseData,
                            SpecialRelayerVariables
                          >({
                            query: QUERY_SPECIAL_RELAYER,
                            variables: {
                              fromChain: sourceChain,
                              toChain: targetChain,
                              bridge: bridgeCategory,
                              relayer: address.toLowerCase(),
                            },
                            fetchPolicy: "no-cache",
                          });
                          if (relayerData.queryLnv20RelayInfos?.total) {
                            notification.warn({
                              title: "Transaction failed",
                              description: `You have registered a relayer that supports this cross-chain.`,
                            });
                            return;
                          }

                          const abi = (await import("../abi/erc20.json")).default;
                          const spender = bridgeContract.sourceAddress;

                          const { request } = await publicClient.simulateContract({
                            address: sourceTokenConfig.address,
                            abi,
                            functionName: "approve",
                            args: [spender, depositMargin.formatted],
                            account: address,
                          });
                          const hash = await walletClient.writeContract(request);
                          await publicClient.waitForTransactionReceipt({ hash });

                          setAllowance(
                            (await publicClient.readContract({
                              address: sourceTokenConfig.address,
                              abi,
                              functionName: "allowance",
                              args: [address, spender],
                            })) as unknown as bigint,
                          );
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setBusy(false);
                        }
                      }
                    } else if (
                      bridgeCategory === "lnbridgev20-default" &&
                      targetChainConfig &&
                      sourceTokenConfig &&
                      targetTokenConfig &&
                      bridgeContract &&
                      walletClient
                    ) {
                      try {
                        setBusy(true);

                        const { data: relayerData } = await apolloClient.query<
                          SpecialRelayerResponseData,
                          SpecialRelayerVariables
                        >({
                          query: QUERY_SPECIAL_RELAYER,
                          variables: {
                            fromChain: sourceChain,
                            toChain: targetChain,
                            bridge: bridgeCategory,
                            relayer: address.toLowerCase(),
                          },
                          fetchPolicy: "no-cache",
                        });
                        if (relayerData.queryLnv20RelayInfos?.total) {
                          notification.warn({
                            title: "Transaction failed",
                            description: `You have registered a relayer that supports this cross-chain.`,
                          });
                          return;
                        }

                        const abi = (await import("../abi/lnbridgev20-default.json")).default;
                        const hash = await walletClient.writeContract({
                          address: bridgeContract.targetAddress,
                          abi,
                          functionName: "setProviderFee",
                          args: [
                            BigInt(targetChainConfig.id),
                            sourceTokenConfig.address,
                            targetTokenConfig.address,
                            baseFee.formatted,
                            feeRate.formatted,
                          ],
                          gas: sourceChain === "arbitrum" || sourceChain === "arbitrum-goerli" ? 1000000n : undefined,
                        });
                        const receipt = await publicClient.waitForTransactionReceipt({ hash });
                        if (receipt.status === "success") {
                          setCurrentStep(Step.THREE);
                        } else {
                          notification.error({
                            title: "Transaction failed",
                            description: <span className="break-all">{receipt.transactionHash}</span>,
                          });
                        }
                      } catch (err) {
                        console.error(err);
                        notification.error({ title: "Transaction failed", description: (err as Error).message });
                      } finally {
                        setBusy(false);
                      }
                    } else if (
                      bridgeCategory === "lnbridgev20-opposite" &&
                      targetChainConfig &&
                      sourceTokenConfig &&
                      targetTokenConfig &&
                      bridgeContract &&
                      walletClient
                    ) {
                      try {
                        setBusy(true);

                        const { data: relayerData } = await apolloClient.query<
                          SpecialRelayerResponseData,
                          SpecialRelayerVariables
                        >({
                          query: QUERY_SPECIAL_RELAYER,
                          variables: {
                            fromChain: sourceChain,
                            toChain: targetChain,
                            bridge: bridgeCategory,
                            relayer: address.toLowerCase(),
                          },
                          fetchPolicy: "no-cache",
                        });
                        if (relayerData.queryLnv20RelayInfos?.total) {
                          notification.warn({
                            title: "Transaction failed",
                            description: `You have registered a relayer that supports this cross-chain.`,
                          });
                          return;
                        }

                        const abi = (await import("../abi/lnbridgev20-opposite.json")).default;
                        const hash = await walletClient.writeContract({
                          address: bridgeContract.targetAddress,
                          abi,
                          functionName: "updateProviderFeeAndMargin",
                          args: [
                            BigInt(targetChainConfig.id),
                            sourceTokenConfig.address,
                            targetTokenConfig.address,
                            depositMargin.formatted,
                            baseFee.formatted,
                            feeRate.formatted,
                          ],
                          value: sourceTokenConfig.type === "native" ? depositMargin.formatted : undefined,
                        });
                        const receipt = await publicClient.waitForTransactionReceipt({ hash });
                        if (receipt.status === "success") {
                          setCurrentStep(Step.THREE);
                        } else {
                          notification.error({
                            title: "Transaction failed",
                            description: <span className="break-all">{receipt.transactionHash}</span>,
                          });
                        }
                      } catch (err) {
                        console.error(err);
                        notification.error({ title: "Transaction failed", description: (err as Error).message });
                      } finally {
                        setBusy(false);
                      }
                    }
                  }
                }}
                disabled={
                  (getChainConfig(sourceChain)?.id === chain?.id &&
                    (depositMargin.formatted === 0n || baseFee.formatted === 0n || feeRate.formatted === 0)) ||
                  (bridgeCategory === "lnbridgev20-default" && completeMargin === false)
                }
                busy={busy}
                className="flex h-9 items-center justify-center"
              >
                <span className="text-sm font-medium text-white">
                  {bridgeCategory === "lnbridgev20-default"
                    ? getChainConfig(sourceChain)?.id !== chain?.id && completeMargin
                      ? "Switch Network"
                      : "Confirm"
                    : bridgeCategory === "lnbridgev20-opposite"
                    ? getChainConfig(sourceChain)?.id !== chain?.id
                      ? "Switch Network"
                      : depositMargin.formatted > allowance
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
                  chainToken={
                    bridgeCategory === "lnbridgev20-default" && targetChain && activeToken
                      ? { network: targetChain, symbol: activeToken }
                      : bridgeCategory === "lnbridgev20-opposite" && sourceChain && activeToken
                      ? { network: sourceChain, symbol: activeToken }
                      : undefined
                  }
                  balance={depositMargin.formatted}
                />
                <StepCompleteItem
                  property="Base Fee"
                  chainToken={sourceChain && activeToken ? { network: sourceChain, symbol: activeToken } : undefined}
                  balance={baseFee.formatted}
                />
                <StepCompleteItem property="Liquidity Fee Rate" percent={feeRate.formatted} />
              </div>
            </>
          )}
        </div>

        {/* step 3 */}
        <div className="bg-component flex flex-col gap-5 p-5 lg:p-[1.875rem]">
          <StepTitle step={3} title="Run a Relayer" />

          {Step.THREE === currentStep && (
            <>
              <Description content="One more step, now run relayer to start relaying messages and earn rewards." />

              <Divider />

              <div
                className="gap-x-small grid items-center gap-y-5 text-sm font-normal text-white"
                style={{ gridTemplateColumns: "130px auto" }}
              >
                <span>Address</span>
                <PrettyAddress address="0x2tJaxND51vBbPwUDHuhVzndY4MeohvvHvn3D9uDejYN" />

                <span>Bridge Type</span>
                <span>
                  {bridgeCategory === "lnbridgev20-default"
                    ? "Default"
                    : bridgeCategory === "lnbridgev20-opposite"
                    ? "Opposite"
                    : "-"}
                </span>

                <span>From</span>
                <PrettyChain network={sourceChain} />

                <span>To</span>
                <PrettyChain network={targetChain} />

                <span>Token</span>
                <PrettyToken network={sourceChain} symbol={activeToken} />

                <span>Margin</span>
                <PrettyMargin
                  margin={depositMargin.formatted}
                  category={bridgeCategory}
                  symbol={activeToken}
                  sourceChain={sourceChain}
                  targetChain={targetChain}
                />

                <span>Base Fee</span>
                <PrettyBaseFee fee={baseFee.formatted} symbol={activeToken} sourceChain={sourceChain} />

                <span>Liquidity Fee Rate</span>
                <span>{feeRate.formatted}%</span>
              </div>

              <Divider />

              <div className="gap-middle flex items-center lg:gap-5">
                <RunRelayer className="inline-flex h-8 flex-1 items-center justify-center lg:h-9" />
                <Button
                  kind="default"
                  onClick={() => {
                    setSourceChain(undefined);
                    setTargetChain(undefined);
                    setActiveToken(undefined);
                    setDepositMargin({ formatted: 0n, value: "" });
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

function RunRelayer({ className, onClick = () => undefined }: { className?: string; onClick?: () => void }) {
  return (
    <a
      href="https://github.com/helix-bridge/relayer/tree/lnv2"
      className={`bg-primary rounded text-sm font-medium text-white transition hover:opacity-80 active:translate-y-1 ${className}`}
      rel="noopener"
      target="_blank"
      onClick={onClick}
    >
      Run Relayer
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
          <Tooltip
            content={<span className="text-xs font-normal text-white">{tips}</span>}
            className="w-fit"
            contentClassName="max-w-[18rem]"
          >
            <Image width={16} height={16} alt="Info" src="/images/info.svg" />
          </Tooltip>
        )}
      </div>
      {children}
    </div>
  );
}

function Description({ content }: { content: string }) {
  return <span className="text-xs font-normal text-white/50">{content}</span>;
}

function PrettyChain({ network }: { network?: Network }) {
  const config = getChainConfig(network);

  return config ? (
    <div className="gap-small flex items-center">
      <Image width={16} height={16} alt="Chain" src={getChainLogoSrc(config.logo)} className="shrink-0 rounded-full" />
      <span>{config.name}</span>
    </div>
  ) : (
    "-"
  );
}

function PrettyToken({ network, symbol }: { network?: Network; symbol?: TokenSymbol }) {
  const token = getChainConfig(network)?.tokens.find((t) => t.symbol === symbol);

  return token ? (
    <div className="gap-small flex items-center">
      <Image width={16} height={16} alt="Chain" src={getTokenLogoSrc(token.logo)} className="shrink-0 rounded-full" />
      <span>{token.symbol}</span>
    </div>
  ) : (
    "-"
  );
}

function PrettyMargin({
  margin,
  category,
  symbol,
  sourceChain,
  targetChain,
}: {
  margin: bigint;
  category?: BridgeCategory;
  symbol?: TokenSymbol;
  sourceChain?: Network;
  targetChain?: Network;
}) {
  const token =
    category === "lnbridgev20-default"
      ? getChainConfig(targetChain)?.tokens.find((t) => t.symbol === symbol)
      : category === "lnbridgev20-opposite"
      ? getChainConfig(sourceChain)?.tokens.find((t) => t.symbol === symbol)
      : null;

  return <span>{token ? formatBalance(margin, token.decimals, { keepZero: false }) : "-"}</span>;
}

function PrettyBaseFee({ fee, symbol, sourceChain }: { fee: bigint; symbol?: TokenSymbol; sourceChain?: Network }) {
  const token = getChainConfig(sourceChain)?.tokens.find((t) => t.symbol === symbol);
  return <span>{token ? formatBalance(fee, token.decimals, { keepZero: false }) : "-"}</span>;
}
