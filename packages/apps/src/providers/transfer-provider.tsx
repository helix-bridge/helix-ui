"use client";

import { BaseBridge } from "@/bridges/base";
import { TransferValue } from "@/components/transfer-input";
import { BridgeCategory } from "@/types/bridge";
import { ChainConfig, Network } from "@/types/chain";
import { Token, TokenSymbol } from "@/types/token";
import { bridgeFactory } from "@/utils/bridge";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Address, useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Subscription, forkJoin } from "rxjs";
import { getParsedCrossChain } from "@/utils/cross-chain";
import { ChainToken } from "@/types/misc";
import { notifyTransaction } from "@/utils/notification";
import { notification } from "@/ui/notification";
import { TransactionReceipt } from "viem";
import { UrlSearchParam } from "@/types/url";
import { getChainConfig } from "@/utils/chain";

const { defaultSourceValue, defaultTargetValue, defaultBridge } = getParsedCrossChain();

interface TransferCtx {
  bridgeCategory: BridgeCategory | undefined;
  transferValue: TransferValue;
  sourceValue: ChainToken | undefined;
  targetValue: ChainToken | undefined;
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  targetToken: Token | undefined;
  bridgeClient: BaseBridge | undefined;
  sourceAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;
  fee: { value: bigint; token: Token } | undefined;

  setTransferValue: Dispatch<SetStateAction<TransferValue>>;
  setBridgeCategory: Dispatch<SetStateAction<BridgeCategory | undefined>>;
  setSourceValue: Dispatch<SetStateAction<ChainToken | undefined>>;
  setTargetValue: Dispatch<SetStateAction<ChainToken | undefined>>;
  setFee: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  transfer: (
    sender: Address,
    recipient: Address,
    amount: bigint,
    options?: Object,
  ) => Promise<TransactionReceipt | undefined>;
  approve: () => Promise<TransactionReceipt | undefined>;
  updateBalance: () => Promise<void>;
}

const defaultValue: TransferCtx = {
  transferValue: { value: "", formatted: 0n },
  sourceValue: defaultSourceValue,
  targetValue: defaultTargetValue,
  sourceChain: defaultSourceValue?.chain,
  targetChain: defaultTargetValue?.chain,
  sourceToken: defaultSourceValue?.token,
  targetToken: defaultTargetValue?.token,
  bridgeCategory: defaultBridge,
  bridgeClient: undefined,
  sourceAllowance: undefined,
  sourceBalance: undefined,
  fee: undefined,
  setBridgeCategory: () => undefined,
  setTransferValue: () => undefined,
  setSourceValue: () => undefined,
  setTargetValue: () => undefined,
  setFee: () => undefined,
  approve: async () => undefined,
  transfer: async () => undefined,
  updateBalance: async () => undefined,
};

export const TransferContext = createContext(defaultValue);

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const [sourceAllowance, setSourceAllowance] = useState(defaultValue.sourceAllowance);
  const [sourceBalance, setSourceBalance] = useState(defaultValue.sourceBalance);

  const [bridgeCategory, setBridgeCategory] = useState(defaultValue.bridgeCategory);
  const [transferValue, setTransferValue] = useState(defaultValue.transferValue);
  const [sourceValue, setSourceValue] = useState(defaultValue.sourceValue);
  const [targetValue, setTargetValue] = useState(defaultValue.targetValue);
  const [fee, setFee] = useState(defaultValue.fee);

  const { sourceChain, sourceToken } = useMemo(
    () => ({ sourceChain: sourceValue?.chain, sourceToken: sourceValue?.token }),
    [sourceValue],
  );
  const { targetChain, targetToken } = useMemo(
    () => ({ targetChain: targetValue?.chain, targetToken: targetValue?.token }),
    [targetValue],
  );

  const { bridgeClient } = useMemo(() => {
    const bridgeClient =
      bridgeCategory &&
      bridgeFactory({
        category: bridgeCategory,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        walletClient,
        publicClient,
      });
    return { bridgeClient };
  }, [sourceChain, targetChain, sourceToken, targetToken, bridgeCategory, walletClient, publicClient]);

  const updateBalance = useCallback(async () => {
    if (address && bridgeClient) {
      try {
        setSourceBalance(await bridgeClient.getSourceBalance(address));
      } catch (err) {
        console.error(err);
      }
    }
  }, [address, bridgeClient]);

  const transfer = useCallback(
    async (sender: Address, recipient: Address, amount: bigint, options?: Object) => {
      if (address && bridgeClient) {
        try {
          const receipt = await bridgeClient.transfer(sender, recipient, amount, options);
          notifyTransaction(receipt, sourceChain);

          const a = await bridgeClient.getSourceAllowance(address);
          const b = await bridgeClient.getSourceBalance(address);
          setSourceAllowance(a);
          setSourceBalance(b);

          return receipt;
        } catch (err) {
          console.error(err);
          notification.error({ title: "Transfer failed", description: (err as Error).message });
        }
      }
    },
    [address, bridgeClient, sourceChain],
  );

  const approve = useCallback(async () => {
    if (address && bridgeClient) {
      try {
        const receipt = await bridgeClient.sourceApprove(transferValue.formatted + (fee?.value || 0n), address);
        notifyTransaction(receipt, sourceChain);

        setSourceAllowance(await bridgeClient.getSourceAllowance(address));

        return receipt;
      } catch (err) {
        console.error(err);
        notification.error({ title: "Transfer failed", description: (err as Error).message });
      }
    }
  }, [address, bridgeClient, sourceChain, transferValue, fee]);

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && bridgeClient) {
      sub$$ = forkJoin([bridgeClient.getSourceAllowance(address), bridgeClient.getSourceBalance(address)]).subscribe({
        next: ([a, b]) => {
          setSourceAllowance(a);
          setSourceBalance(b);
        },
        error: (err) => {
          console.error(err);
          setSourceAllowance(defaultValue.sourceAllowance);
          setSourceBalance(defaultValue.sourceBalance);
        },
      });
    } else {
      setSourceAllowance(defaultValue.sourceAllowance);
      setSourceBalance(defaultValue.sourceBalance);
    }

    return () => sub$$?.unsubscribe();
  }, [address, bridgeClient]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const _category = params.get(UrlSearchParam.BRIDGE) as BridgeCategory;
    const _sourceChain = getChainConfig(params.get(UrlSearchParam.SOURCE_CHAIN) as Network);
    const _targetChain = getChainConfig(params.get(UrlSearchParam.TARGET_CHAIN) as Network);

    const sourceSymbol = params.get(UrlSearchParam.SOURCE_TOKEN) as TokenSymbol;
    const targetSymbol = params.get(UrlSearchParam.TARGET_TOKEN) as TokenSymbol;

    const _sourceToken = _sourceChain?.tokens.find((t) => t.symbol === sourceSymbol);
    const _targetToken = _targetChain?.tokens.find((t) => t.symbol === targetSymbol);

    const _cross = _sourceToken?.cross.find(
      (c) =>
        c.bridge.category === _category &&
        c.target.network === _targetChain?.network &&
        c.target.symbol === targetSymbol,
    );

    if (
      _cross &&
      _sourceChain &&
      _targetChain &&
      _sourceToken &&
      _targetToken &&
      !_sourceChain?.hidden &&
      !_targetChain?.hidden
    ) {
      setBridgeCategory(_category);
      setSourceValue({ chain: _sourceChain, token: _sourceToken });
      setTargetValue({ chain: _targetChain, token: _targetToken });
    }
  }, []);

  return (
    <TransferContext.Provider
      value={{
        sourceAllowance,
        sourceBalance,
        bridgeCategory,
        bridgeClient,
        transferValue,
        sourceValue,
        targetValue,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        fee,
        setBridgeCategory,
        setTransferValue,
        setSourceValue,
        setTargetValue,
        setFee,
        approve,
        updateBalance,
        transfer,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}
