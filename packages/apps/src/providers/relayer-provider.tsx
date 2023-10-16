"use client";

import { LnBridgeDefault } from "@/bridges/lnbridge-default";
import { LnBridgeOpposite } from "@/bridges/lnbridge-opposite";
import { BridgeCategory } from "@/types/bridge";
import { ChainConfig } from "@/types/chain";
import { Token } from "@/types/token";
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
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Subscription, forkJoin } from "rxjs";
import { notification } from "@/ui/notification";
import { notifyTransaction } from "@/utils/notification";
import { TransactionReceipt } from "viem";
import { getChainConfig } from "@/utils/chain";

interface RelayerCtx {
  margin: { formatted: bigint; value: string };
  baseFee: { formatted: bigint; value: string };
  feeRate: { formatted: number; value: string };
  sourceAllowance: { value: bigint; token: Token } | undefined;
  targetAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;
  targetBalance: { value: bigint; token: Token } | undefined;
  bridgeCategory: BridgeCategory | undefined;
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  targetToken: Token | undefined;
  defaultBridge: LnBridgeDefault | undefined;
  oppositeBridge: LnBridgeOpposite | undefined;

  setMargin: Dispatch<SetStateAction<{ formatted: bigint; value: string }>>;
  setBaseFee: Dispatch<SetStateAction<{ formatted: bigint; value: string }>>;
  setFeeRate: Dispatch<SetStateAction<{ formatted: number; value: string }>>;
  setBridgeCategory: Dispatch<SetStateAction<BridgeCategory | undefined>>;
  setSourceChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setSourceToken: Dispatch<SetStateAction<Token | undefined>>;
  sourceApprove: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  targetApprove: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  depositMargin: (margin: bigint) => Promise<TransactionReceipt | undefined>;
  updateFeeAndMargin: (margin: bigint, baseFee: bigint, feeRate: number) => Promise<TransactionReceipt | undefined>;
  setFeeAndRate: (baseFee: bigint, feeRate: number) => Promise<TransactionReceipt | undefined>;
}

const defaultValue: RelayerCtx = {
  margin: { formatted: 0n, value: "" },
  baseFee: { formatted: 0n, value: "" },
  feeRate: { formatted: 0, value: "" },
  sourceAllowance: undefined,
  targetAllowance: undefined,
  sourceBalance: undefined,
  targetBalance: undefined,
  bridgeCategory: undefined,
  sourceChain: undefined,
  targetChain: undefined,
  sourceToken: undefined,
  targetToken: undefined,
  defaultBridge: undefined,
  oppositeBridge: undefined,
  setMargin: () => undefined,
  setBaseFee: () => undefined,
  setFeeRate: () => undefined,
  setBridgeCategory: () => undefined,
  setSourceChain: () => undefined,
  setTargetChain: () => undefined,
  setSourceToken: () => undefined,
  sourceApprove: async () => undefined,
  targetApprove: async () => undefined,
  depositMargin: async () => undefined,
  updateFeeAndMargin: async () => undefined,
  setFeeAndRate: async () => undefined,
};

export const RelayerContext = createContext(defaultValue);

export default function RelayerProvider({ children }: PropsWithChildren<unknown>) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const [margin, setMargin] = useState(defaultValue.margin);
  const [baseFee, setBaseFee] = useState(defaultValue.baseFee);
  const [feeRate, setFeeRate] = useState(defaultValue.feeRate);

  const [sourceAllowance, setSourceAllowance] = useState(defaultValue.sourceAllowance);
  const [targetAllowance, setTargetAllowance] = useState(defaultValue.targetAllowance);
  const [sourceBalance, setSourceBalance] = useState(defaultValue.sourceBalance);
  const [targetBalance, setTargetBalance] = useState(defaultValue.targetBalance);

  const [bridgeCategory, setBridgeCategory] = useState(defaultValue.bridgeCategory);
  const [sourceChain, setSourceChain] = useState(defaultValue.sourceChain);
  const [targetChain, setTargetChain] = useState(defaultValue.targetChain);
  const [sourceToken, setSourceToken] = useState(defaultValue.sourceToken);

  const targetToken = useMemo(() => {
    const cross = sourceChain?.tokens
      .find((t) => t.symbol === sourceToken?.symbol)
      ?.cross.find((c) => c.bridge.category === bridgeCategory && c.target.network === targetChain?.network);
    return getChainConfig(cross?.target.network)?.tokens.find((t) => t.symbol === cross?.target.symbol);
  }, [bridgeCategory, sourceChain, targetChain, sourceToken]);

  const { defaultBridge, oppositeBridge, bridgeClient } = useMemo(() => {
    let defaultBridge: LnBridgeDefault | undefined;
    let oppositeBridge: LnBridgeOpposite | undefined;

    if (bridgeCategory === "lnbridgev20-default") {
      defaultBridge = new LnBridgeDefault({
        category: bridgeCategory,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        walletClient,
        publicClient,
      });
    } else if (bridgeCategory === "lnbridgev20-opposite") {
      oppositeBridge = new LnBridgeOpposite({
        category: bridgeCategory,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        walletClient,
        publicClient,
      });
    }

    return { defaultBridge, oppositeBridge, bridgeClient: defaultBridge ?? oppositeBridge };
  }, [sourceChain, targetChain, sourceToken, targetToken, bridgeCategory, walletClient, publicClient]);

  const sourceApprove = useCallback(
    async (amount: bigint) => {
      if (address && bridgeClient) {
        try {
          const receipt = await bridgeClient.sourceApprove(amount, address);
          notifyTransaction(receipt, sourceChain);

          setSourceAllowance(await bridgeClient.getSourceAllowance(address));

          return receipt;
        } catch (err) {
          console.error(err);
          notification.error({ title: "Approve failed", description: (err as Error).message });
        }
      }
    },
    [address, bridgeClient, sourceChain],
  );

  const targetApprove = useCallback(
    async (amount: bigint) => {
      if (address && bridgeClient) {
        try {
          const receipt = await bridgeClient.targetApprove(amount, address);
          notifyTransaction(receipt, sourceChain);

          setTargetAllowance(await bridgeClient.getTargetAllowance(address));

          return receipt;
        } catch (err) {
          console.error(err);
          notification.error({ title: "Approve failed", description: (err as Error).message });
        }
      }
    },
    [address, bridgeClient, sourceChain],
  );

  const depositMargin = useCallback(
    async (margin: bigint) => {
      if (address && defaultBridge) {
        try {
          const receipt = await defaultBridge.depositMargin(margin);
          notifyTransaction(receipt, sourceChain);

          const a = await defaultBridge.getTargetAllowance(address);
          const b = await defaultBridge.getTargetBalance(address);
          setTargetAllowance(a);
          setTargetBalance(b);

          return receipt;
        } catch (err) {
          console.error(err);
          notification.error({ title: "Deposit failed", description: (err as Error).message });
        }
      }
    },
    [address, defaultBridge, sourceChain],
  );

  const setFeeAndRate = useCallback(
    async (baseFee: bigint, feeRate: number) => {
      if (defaultBridge) {
        try {
          const receipt = await defaultBridge.setFeeAndRate(baseFee, feeRate);
          notifyTransaction(receipt, sourceChain);
          return receipt;
        } catch (err) {
          console.error(err);
          notification.error({ title: "Setting failed", description: (err as Error).message });
        }
      }
    },
    [sourceChain, defaultBridge],
  );

  const updateFeeAndMargin = useCallback(
    async (margin: bigint, baseFee: bigint, feeRate: number) => {
      if (address && oppositeBridge) {
        try {
          const receipt = await oppositeBridge.updateFeeAndMargin(margin, baseFee, feeRate);
          notifyTransaction(receipt, sourceChain);

          const a = await oppositeBridge.getSourceAllowance(address);
          const b = await oppositeBridge.getSourceBalance(address);
          setSourceAllowance(a);
          setSourceBalance(b);

          return receipt;
        } catch (err) {
          console.error(err);
          notification.error({ title: "Transfer failed", description: (err as Error).message });
        }
      }
    },
    [address, oppositeBridge, sourceChain],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && bridgeClient) {
      sub$$ = forkJoin([
        bridgeClient.getSourceAllowance(address),
        bridgeClient.getTargetAllowance(address),
        bridgeClient.getSourceBalance(address),
        bridgeClient.getTargetBalance(address),
      ]).subscribe({
        next: ([as, at, bs, bt]) => {
          setSourceAllowance(as);
          setTargetAllowance(at);
          setSourceBalance(bs);
          setTargetBalance(bt);
        },
        error: (err) => {
          console.error(err);
          setSourceAllowance(defaultValue.sourceAllowance);
          setTargetAllowance(defaultValue.targetAllowance);
          setSourceBalance(defaultValue.sourceBalance);
          setTargetBalance(defaultValue.targetBalance);
        },
      });
    } else {
      setSourceAllowance(defaultValue.sourceAllowance);
      setTargetAllowance(defaultValue.targetAllowance);
      setSourceBalance(defaultValue.sourceBalance);
      setTargetBalance(defaultValue.targetBalance);
    }

    return () => sub$$?.unsubscribe();
  }, [address, bridgeClient]);

  return (
    <RelayerContext.Provider
      value={{
        margin,
        baseFee,
        feeRate,
        sourceBalance,
        targetBalance,
        sourceAllowance,
        targetAllowance,
        bridgeCategory,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        defaultBridge,
        oppositeBridge,
        setMargin,
        setBaseFee,
        setFeeRate,
        setBridgeCategory,
        setSourceChain,
        setTargetChain,
        setSourceToken,
        sourceApprove,
        targetApprove,
        depositMargin,
        updateFeeAndMargin,
        setFeeAndRate,
      }}
    >
      {children}
    </RelayerContext.Provider>
  );
}
