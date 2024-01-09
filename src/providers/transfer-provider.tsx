"use client";

import { BaseBridge } from "@/bridges";
import {
  BridgeCategory,
  ChainConfig,
  InputValue,
  Network,
  Token,
  TokenSymbol,
  TransferOptions,
  UrlSearchParamKey,
} from "@/types";
import { getChainConfig, getCrossDefaultValue, notifyError, notifyTransaction } from "@/utils";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useEffect, useState } from "react";
import { Address, TransactionReceipt } from "viem";
import { useAccount } from "wagmi";
import { Subscription, forkJoin } from "rxjs";
import { ReadonlyURLSearchParams } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface UpdateUrlParamsOptions {
  _category?: BridgeCategory | undefined;
  _sourceChain?: ChainConfig | undefined;
  _targetChain?: ChainConfig | undefined;
  _sourceToken?: Token | undefined;
  _targetToken?: Token | undefined;
}

interface TransferCtx {
  bridgeInstance: BaseBridge | undefined;
  bridgeCategory: BridgeCategory | undefined;
  transferAmount: InputValue<bigint>;
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  targetToken: Token | undefined;
  sourceAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;
  bridgeFee: { value: bigint; token: Token } | undefined;
  dailyLimit: { limit: bigint; spent: bigint; token: Token } | undefined;

  setBridgeInstance: Dispatch<SetStateAction<BaseBridge | undefined>>;
  setBridgeCategory: Dispatch<SetStateAction<BridgeCategory | undefined>>;
  setTransferAmount: Dispatch<SetStateAction<InputValue<bigint>>>;
  setSourceChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setSourceToken: Dispatch<SetStateAction<Token | undefined>>;
  setTargetToken: Dispatch<SetStateAction<Token | undefined>>;
  setSourceAllowance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setSourceBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setBridgeFee: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setDailyLimit: Dispatch<SetStateAction<{ limit: bigint; spent: bigint; token: Token } | undefined>>;

  transfer: (
    sender: Address,
    recipient: Address,
    amount: bigint,
    bridge: BaseBridge,
    chain: ChainConfig,
    options?: TransferOptions,
  ) => Promise<TransactionReceipt | undefined>;
  sourceApprove: (
    owner: Address,
    amount: bigint,
    bridge: BaseBridge,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  updateSourceBalance: (sender: Address, bridge: BaseBridge) => Promise<void>;
  updateUrlParams: (
    router: AppRouterInstance,
    searchParams: ReadonlyURLSearchParams,
    options: UpdateUrlParamsOptions,
  ) => void;
}

const { defaultBridgeCategory, defaultSourceChain, defaultTargetChain, defaultSourceToken, defaultTargetToken } =
  getCrossDefaultValue();

const defaultValue: TransferCtx = {
  bridgeInstance: undefined,
  bridgeCategory: defaultBridgeCategory,
  transferAmount: { value: 0n, input: "", valid: true },
  sourceChain: defaultSourceChain,
  targetChain: defaultTargetChain,
  sourceToken: defaultSourceToken,
  targetToken: defaultTargetToken,
  sourceAllowance: undefined,
  sourceBalance: undefined,
  bridgeFee: undefined,
  dailyLimit: undefined,

  setBridgeInstance: () => undefined,
  setBridgeCategory: () => undefined,
  setTransferAmount: () => undefined,
  setSourceChain: () => undefined,
  setTargetChain: () => undefined,
  setSourceToken: () => undefined,
  setTargetToken: () => undefined,
  setSourceAllowance: () => undefined,
  setSourceBalance: () => undefined,
  setBridgeFee: () => undefined,
  setDailyLimit: () => undefined,

  transfer: async () => undefined,
  sourceApprove: async () => undefined,
  updateSourceBalance: async () => undefined,
  updateUrlParams: () => undefined,
};

export const TransferContext = createContext(defaultValue);

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  const { address } = useAccount();

  const [bridgeInstance, setBridgeInstance] = useState(defaultValue.bridgeInstance);
  const [bridgeCategory, setBridgeCategory] = useState(defaultValue.bridgeCategory);
  const [transferAmount, setTransferAmount] = useState(defaultValue.transferAmount);
  const [sourceChain, setSourceChain] = useState(defaultValue.sourceChain);
  const [targetChain, setTargetChain] = useState(defaultValue.targetChain);
  const [sourceToken, setSourceToken] = useState(defaultValue.sourceToken);
  const [targetToken, setTargetToken] = useState(defaultValue.targetToken);
  const [sourceAllowance, setSourceAllowance] = useState(defaultValue.sourceAllowance);
  const [sourceBalance, setSourceBalance] = useState(defaultValue.sourceBalance);
  const [bridgeFee, setBridgeFee] = useState(defaultValue.bridgeFee);
  const [dailyLimit, setDailyLimit] = useState(defaultValue.dailyLimit);

  const transfer = useCallback(
    async (
      sender: Address,
      recipient: Address,
      amount: bigint,
      bridge: BaseBridge,
      chain: ChainConfig,
      options?: TransferOptions,
    ) => {
      try {
        const receipt = await bridge.transfer(sender, recipient, amount, options);
        notifyTransaction(receipt, chain);

        const a = await bridge.getSourceAllowance(sender);
        const b = await bridge.getSourceBalance(sender);
        setSourceAllowance(a);
        setSourceBalance(b);

        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [],
  );

  const sourceApprove = useCallback(async (owner: Address, amount: bigint, bridge: BaseBridge, chain: ChainConfig) => {
    try {
      const receipt = await bridge.sourceApprove(amount, owner);
      notifyTransaction(receipt, chain);
      setSourceAllowance(await bridge.getSourceAllowance(owner));
      return receipt;
    } catch (err) {
      console.error(err);
      notifyError(err);
    }
  }, []);

  const updateSourceBalance = useCallback(async (sender: Address, bridge: BaseBridge) => {
    try {
      setSourceBalance(await bridge.getSourceBalance(sender));
    } catch (err) {
      console.error(err);
      setSourceBalance(undefined);
    }
  }, []);

  const updateUrlParams = useCallback(
    (
      router: AppRouterInstance,
      searchParams: ReadonlyURLSearchParams,
      { _category, _sourceChain, _targetChain, _sourceToken, _targetToken }: UpdateUrlParamsOptions,
    ) => {
      const params = new URLSearchParams(searchParams.toString());
      const c = _category || bridgeCategory;
      const sc = _sourceChain || sourceChain;
      const tc = _targetChain || targetChain;
      const st = _sourceToken || sourceToken;
      const tt = _targetToken || targetToken;

      c && params.set(UrlSearchParamKey.BRIDGE, c);
      sc && params.set(UrlSearchParamKey.SOURCE_CHAIN, sc.network);
      tc && params.set(UrlSearchParamKey.TARGET_CHAIN, tc.network);
      st && params.set(UrlSearchParamKey.SOURCE_TOKEN, st.symbol);
      tt && params.set(UrlSearchParamKey.TARGET_TOKEN, tt.symbol);
      router.push(`?${params.toString()}`);
    },
    [bridgeCategory, sourceChain, targetChain, sourceToken, targetToken],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && bridgeInstance) {
      sub$$ = forkJoin([
        bridgeInstance.getSourceAllowance(address),
        bridgeInstance.getSourceBalance(address),
        bridgeInstance.getDailyLimit(),
      ]).subscribe({
        next: ([allowance, balance, limit]) => {
          setSourceAllowance(allowance);
          setSourceBalance(balance);
          setDailyLimit(limit);
        },
        error: (err) => {
          console.error(err);
          setSourceAllowance(defaultValue.sourceAllowance);
          setSourceBalance(defaultValue.sourceBalance);
          setDailyLimit(defaultValue.dailyLimit);
        },
      });
    } else {
      setSourceAllowance(defaultValue.sourceAllowance);
      setSourceBalance(defaultValue.sourceBalance);
      setDailyLimit(defaultValue.dailyLimit);
    }

    return () => sub$$?.unsubscribe();
  }, [address, bridgeInstance]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlCategory = params.get(UrlSearchParamKey.BRIDGE) as BridgeCategory;
    const urlSourceChain = getChainConfig(params.get(UrlSearchParamKey.SOURCE_CHAIN) as Network);
    const urlTargetChain = getChainConfig(params.get(UrlSearchParamKey.TARGET_CHAIN) as Network);
    const urlSourceSymbol = params.get(UrlSearchParamKey.SOURCE_TOKEN) as TokenSymbol;
    const urlTargetSymbol = params.get(UrlSearchParamKey.TARGET_TOKEN) as TokenSymbol;

    const _sourceToken = urlSourceChain?.tokens.find((t) => t.symbol === urlSourceSymbol);
    const _targetToken = urlTargetChain?.tokens.find((t) => t.symbol === urlTargetSymbol);

    const _cross = _sourceToken?.cross.find(
      (c) =>
        c.bridge.category === urlCategory &&
        c.target.network === urlTargetChain?.network &&
        c.target.symbol === urlTargetSymbol,
    );

    if (
      _cross &&
      urlSourceChain &&
      urlTargetChain &&
      _sourceToken &&
      _targetToken &&
      !_cross.hidden &&
      !urlSourceChain?.hidden &&
      !urlTargetChain?.hidden
    ) {
      setBridgeCategory(urlCategory);
      setSourceChain(urlSourceChain);
      setTargetChain(urlTargetChain);
      setSourceToken(_sourceToken);
      setTargetToken(_targetToken);
    }
  }, []);

  return (
    <TransferContext.Provider
      value={{
        bridgeInstance,
        bridgeCategory,
        transferAmount,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        sourceAllowance,
        sourceBalance,
        bridgeFee,
        dailyLimit,

        setBridgeInstance,
        setBridgeCategory,
        setTransferAmount,
        setSourceChain,
        setTargetChain,
        setSourceToken,
        setTargetToken,
        setSourceAllowance,
        setSourceBalance,
        setBridgeFee,
        setDailyLimit,

        transfer,
        sourceApprove,
        updateSourceBalance,
        updateUrlParams,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}
