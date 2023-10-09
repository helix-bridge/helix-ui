import Modal from "@/ui/modal";
import SegmentedTabs, { SegmentedTabsProps } from "@/ui/segmented-tabs";
import Tooltip from "@/ui/tooltip";
import Image from "next/image";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { BalanceInput, BalanceInputValue } from "./balance-input";
import LiquidityFeeRateInput from "./liquidity-fee-rate-input";
import { LnRelayerInfo } from "@/types/graphql";
import { getChainConfig } from "@/utils/chain";
import { Subscription, forkJoin, from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork, useWalletClient } from "wagmi";
import { fetchBalance } from "wagmi/actions";
import { notification } from "@/ui/notification";
import { bridgeFactory } from "@/utils/bridge";
import { BridgeContract } from "@/types/bridge";
import { formatBalance } from "@/utils/balance";

type TabKey = "update" | "deposit" | "withdraw";

interface Props {
  relayerInfo?: LnRelayerInfo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RelayerManageModal({ relayerInfo, isOpen, onClose, onSuccess }: Props) {
  const [activeKey, setActiveKey] = useState<SegmentedTabsProps<TabKey>["activeKey"]>("update");
  const [height, setHeight] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [balance, setBalance] = useState<bigint>();
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [depositMargin, setDepositMargin] = useState<BalanceInputValue>({ formatted: 0n, value: "" });
  const [baseFee, setBaseFee] = useState<BalanceInputValue>({ formatted: 0n, value: "" });
  const [feeRate, setFeeRate] = useState<{ formatted: number; value: string }>({ formatted: 0, value: "" });

  const { address } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { bridgeContract, bridgeCategory, sourceChainConfig, targetChainConfig, sourceTokenConfig, targetTokenConfig } =
    useMemo(() => {
      const sourceChainConfig = getChainConfig(relayerInfo?.fromChain);
      const sourceTokenConfig = sourceChainConfig?.tokens.find(
        (t) => t.address.toLowerCase() === relayerInfo?.sendToken?.toLowerCase(),
      );

      let bridgeContract: BridgeContract | undefined = undefined;
      if (relayerInfo?.bridge) {
        bridgeContract = bridgeFactory({ category: relayerInfo.bridge })?.getInfo().contract;
      }
      const cross = sourceTokenConfig?.cross.find(
        (c) => c.bridge.category === relayerInfo?.bridge && c.target.network === relayerInfo.toChain,
      );

      const targetChainConfig = getChainConfig(relayerInfo?.toChain);
      const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === cross?.target.symbol);

      return {
        bridgeContract,
        bridgeCategory: relayerInfo?.bridge,
        sourceChainConfig,
        targetChainConfig,
        sourceTokenConfig,
        targetTokenConfig,
      };
    }, [relayerInfo]);

  const okText = useMemo(() => {
    let text = "Confirm";

    if (activeKey === "deposit") {
      if (bridgeCategory === "lnbridgev20-default") {
        if (chain?.id !== targetChainConfig?.id) {
          text = "Switch Network";
        } else if (depositMargin.formatted > allowance) {
          text = "Approve";
        }
      } else if (bridgeCategory === "lnbridgev20-opposite") {
        if (chain?.id !== sourceChainConfig?.id) {
          text = "Switch Network";
        } else if (depositMargin.formatted > allowance) {
          text = "Approve";
        }
      }
    } else if (chain?.id !== sourceChainConfig?.id) {
      text = "Switch Network";
    }

    return text;
  }, [activeKey, allowance, bridgeCategory, chain, depositMargin, sourceChainConfig, targetChainConfig]);

  useEffect(() => {
    const sourceChainConfig = getChainConfig(relayerInfo?.fromChain);
    const sourceTokenConfig = sourceChainConfig?.tokens.find(
      (t) => t.address.toLowerCase() === relayerInfo?.sendToken?.toLowerCase(),
    );

    let bridgeContract: BridgeContract | undefined = undefined;
    if (relayerInfo?.bridge) {
      bridgeContract = bridgeFactory({ category: relayerInfo.bridge })?.getInfo().contract;
    }
    const cross = sourceTokenConfig?.cross.find(
      (c) => c.bridge.category === relayerInfo?.bridge && c.target.network === relayerInfo.toChain,
    );

    const targetChainConfig = getChainConfig(relayerInfo?.toChain);
    const targetTokenConfig = targetChainConfig?.tokens.find((t) => t.symbol === cross?.target.symbol);

    if (relayerInfo?.baseFee && sourceTokenConfig) {
      setBaseFee({
        formatted: BigInt(relayerInfo.baseFee),
        value: formatBalance(BigInt(relayerInfo.baseFee), sourceTokenConfig.decimals),
      });
    }

    if (relayerInfo?.liquidityFeeRate) {
      setFeeRate({ formatted: Number(relayerInfo.liquidityFeeRate), value: `${relayerInfo.liquidityFeeRate}` });
    }

    if (relayerInfo?.bridge === "lnbridgev20-default" && targetTokenConfig && relayerInfo.margin) {
      setDepositMargin({
        formatted: BigInt(relayerInfo.margin),
        value: formatBalance(BigInt(relayerInfo.margin), targetTokenConfig.decimals),
      });
    } else if (relayerInfo?.bridge === "lnbridgev20-opposite" && sourceTokenConfig && relayerInfo.margin) {
      setDepositMargin({
        formatted: BigInt(relayerInfo.margin),
        value: formatBalance(BigInt(relayerInfo.margin), sourceTokenConfig.decimals),
      });
    }
  }, [relayerInfo]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && chain && bridgeContract && bridgeCategory) {
      if (bridgeCategory === "lnbridgev20-default" && chain.id === targetChainConfig?.id && targetTokenConfig) {
        sub$$ = from(import("@/abi/erc20.json"))
          .pipe(
            switchMap((abi) =>
              forkJoin([
                fetchBalance({ address, token: targetTokenConfig.address }),
                publicClient.readContract({
                  address: targetTokenConfig.address,
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
      } else if (
        bridgeCategory === "lnbridgev20-opposite" &&
        chain?.id === sourceChainConfig?.id &&
        sourceTokenConfig
      ) {
        sub$$ = from(import("@/abi/erc20.json"))
          .pipe(
            switchMap((abi) =>
              forkJoin([
                fetchBalance({ address, token: sourceTokenConfig.address }),
                publicClient.readContract({
                  address: sourceTokenConfig.address,
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
      } else {
        setBalance(undefined);
        setAllowance(0n);
      }
    } else {
      setBalance(undefined);
      setAllowance(0n);
    }

    return () => sub$$?.unsubscribe();
  }, [
    chain,
    address,
    bridgeCategory,
    bridgeContract,
    sourceChainConfig,
    targetChainConfig,
    sourceTokenConfig,
    targetTokenConfig,
    publicClient,
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
            if (chain?.id !== sourceChainConfig?.id) {
              switchNetwork?.(sourceChainConfig?.id);
            } else if (bridgeCategory === "lnbridgev20-default") {
              if (walletClient && bridgeContract && targetChainConfig && sourceTokenConfig && targetTokenConfig) {
                setBusy(true);

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
                  gas:
                    sourceChainConfig?.network === "arbitrum" || sourceChainConfig?.network === "arbitrum-goerli"
                      ? 1000000n
                      : undefined,
                });
                const receipt = await publicClient.waitForTransactionReceipt({ hash });
                if (receipt.status === "success") {
                  onSuccess();
                  onClose();
                } else {
                  notification.error({
                    title: "Transaction failed",
                    description: <span className="break-all">{receipt.transactionHash}</span>,
                  });
                }
              }
            } else if (bridgeCategory === "lnbridgev20-opposite") {
              if (walletClient && bridgeContract && targetChainConfig && sourceTokenConfig && targetTokenConfig) {
                setBusy(true);

                const abi = (await import("../abi/lnbridgev20-opposite.json")).default;
                const hash = await walletClient.writeContract({
                  address: bridgeContract.sourceAddress,
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
                  onSuccess();
                  onClose();
                } else {
                  notification.error({
                    title: "Transaction failed",
                    description: <span className="break-all">{receipt.transactionHash}</span>,
                  });
                }
              }
            }
          } else if (activeKey === "deposit") {
            if (bridgeCategory === "lnbridgev20-default") {
              if (chain?.id !== targetChainConfig?.id) {
                switchNetwork?.(targetChainConfig?.id);
              } else if (depositMargin.formatted > allowance) {
                if (bridgeContract && targetTokenConfig && walletClient) {
                  setBusy(true);

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
                }
              } else if (
                walletClient &&
                bridgeContract &&
                sourceChainConfig &&
                sourceTokenConfig &&
                targetTokenConfig
              ) {
                setBusy(true);

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
                  onSuccess();
                  onClose();
                } else {
                  notification.error({
                    title: "Transaction failed",
                    description: <span className="break-all">{receipt.transactionHash}</span>,
                  });
                }
              }
            } else if (bridgeCategory === "lnbridgev20-opposite") {
              if (chain?.id !== sourceChainConfig?.id) {
                switchNetwork?.(sourceChainConfig?.id);
              } else if (depositMargin.formatted > allowance) {
                if (bridgeContract && sourceTokenConfig && walletClient) {
                  setBusy(true);

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
                }
              } else if (
                walletClient &&
                bridgeContract &&
                targetChainConfig &&
                sourceTokenConfig &&
                targetTokenConfig
              ) {
                setBusy(true);

                const abi = (await import("../abi/lnbridgev20-opposite.json")).default;
                const hash = await walletClient.writeContract({
                  address: bridgeContract.sourceAddress,
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
                  onSuccess();
                  onClose();
                } else {
                  notification.error({
                    title: "Transaction failed",
                    description: <span className="break-all">{receipt.transactionHash}</span>,
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error(err);
          notification.error({ title: "Transaction failed", description: (err as Error).message });
        } finally {
          setBusy(false);
        }
      }}
      busy={busy}
      disabledCancel={busy}
      disabledOk={
        activeKey === "update" && baseFee.formatted === 0n && feeRate.formatted === 0
          ? true
          : activeKey === "deposit" && depositMargin.formatted === 0n
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
                  <BalanceInput
                    chainToken={
                      sourceChainConfig && sourceTokenConfig
                        ? { network: sourceChainConfig.network, symbol: sourceTokenConfig.symbol }
                        : undefined
                    }
                    value={baseFee}
                    onChange={setBaseFee}
                  />
                </LabelSection>
                <LabelSection label="Liquidity Fee Rate">
                  <LiquidityFeeRateInput value={feeRate} onChange={setFeeRate} />
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
                  balance={balance}
                  chainToken={
                    bridgeCategory === "lnbridgev20-default" && targetChainConfig && targetTokenConfig
                      ? { network: targetChainConfig.network, symbol: targetTokenConfig.symbol }
                      : bridgeCategory === "lnbridgev20-opposite" && sourceChainConfig && sourceTokenConfig
                      ? { network: sourceChainConfig.network, symbol: sourceTokenConfig.symbol }
                      : undefined
                  }
                  value={depositMargin}
                  onChange={setDepositMargin}
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
                <BalanceInput chainToken={{ network: "goerli", symbol: "USDC" }} />
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
