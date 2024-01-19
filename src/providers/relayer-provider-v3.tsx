"use client";

import { LnBridgeV3 } from "@/bridges";
import { ChainConfig, CheckLnBridgeExistReqParams, CheckLnBridgeExistResData, Token } from "@/types";
import { getAvailableTargetTokens, notifyError, notifyTransaction } from "@/utils";
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
import { TransactionReceipt } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Subscription, forkJoin } from "rxjs";
import { ApolloClient } from "@apollo/client";
import { GQL_CHECK_LNBRIDGE_EXIST } from "@/config";
import { notification } from "@/ui/notification";

interface RelayerCtx {
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  penaltyReserve: bigint | undefined;
  baseFee: bigint | undefined;
  feeRate: number | undefined;
  sourceAllowance: { value: bigint; token: Token } | undefined;
  targetAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;
  targetBalance: { value: bigint; token: Token } | undefined;

  setSourceChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setSourceToken: Dispatch<SetStateAction<Token | undefined>>;
  // setBaseFee: Dispatch<SetStateAction<bigint | undefined>>;
  // setFeeRate: Dispatch<SetStateAction<number | undefined>>;
  // setPenaltyReserve: Dispatch<SetStateAction<bigint | undefined>>;
  // setSourceAllowance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  // setSourceBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  // setTargetBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;

  sourceApprove: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  targetApprove: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  depositPenaltyReserve: (amount: bigint) => Promise<TransactionReceipt | undefined>;
  registerLnProvider: (
    baseFee: bigint,
    feeRate: number,
    transferLimit: bigint,
  ) => Promise<TransactionReceipt | undefined>;
  isLnBridgeExist: (apolloClient: ApolloClient<object>) => Promise<boolean>;
  updatePenaltyReserves: () => Promise<void>;
}

const defaultValue: RelayerCtx = {
  sourceChain: undefined,
  targetChain: undefined,
  sourceToken: undefined,
  penaltyReserve: undefined,
  baseFee: undefined,
  feeRate: undefined,
  sourceAllowance: undefined,
  targetAllowance: undefined,
  sourceBalance: undefined,
  targetBalance: undefined,

  setSourceChain: () => undefined,
  setTargetChain: () => undefined,
  setSourceToken: () => undefined,
  // setPenaltyReserve: () => undefined,
  // setBaseFee: () => undefined,
  // setFeeRate: () => undefined,
  // setSourceAllowance: () => undefined,
  // setTargetAllowance: () => undefined,
  // setSourceBalance: () => undefined,
  // setTargetBalance: () => undefined,

  isLnBridgeExist: async () => false,
  sourceApprove: async () => undefined,
  targetApprove: async () => undefined,
  depositPenaltyReserve: async () => undefined,
  registerLnProvider: async () => undefined,
  updatePenaltyReserves: async () => undefined,
};

export const RelayerContext = createContext(defaultValue);

export default function RelayerProviderV3({ children }: PropsWithChildren<unknown>) {
  const [sourceChain, setSourceChain] = useState(defaultValue.sourceChain);
  const [targetChain, setTargetChain] = useState(defaultValue.targetChain);
  const [sourceToken, setSourceToken] = useState(defaultValue.sourceToken);
  const [baseFee, setBaseFee] = useState(defaultValue.baseFee);
  const [feeRate, setFeeRate] = useState(defaultValue.feeRate);
  const [penaltyReserve, setPenaltyReserve] = useState(defaultValue.penaltyReserve);
  const [sourceAllowance, setSourceAllowance] = useState(defaultValue.sourceAllowance);
  const [targetAllowance, setTargetAllowance] = useState(defaultValue.targetAllowance);
  const [sourceBalance, setSourceBalance] = useState(defaultValue.sourceBalance);
  const [targetBalance, setTargetBalance] = useState(defaultValue.targetBalance);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const targetToken = useMemo(
    () => getAvailableTargetTokens(sourceChain, targetChain, sourceToken).at(0),
    [sourceChain, targetChain, sourceToken],
  );

  const bridgeInstance = useMemo(
    () =>
      new LnBridgeV3({
        category: "lnbridge",
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        publicClient,
        walletClient,
      }),
    [sourceChain, targetChain, sourceToken, targetToken, walletClient, publicClient],
  );

  const isLnBridgeExist = useCallback(
    async (apolloClient: ApolloClient<object>) => {
      const { data: lnbridgeData } = await apolloClient.query<CheckLnBridgeExistResData, CheckLnBridgeExistReqParams>({
        query: GQL_CHECK_LNBRIDGE_EXIST,
        variables: {
          fromChainId: sourceChain?.id,
          toChainId: targetChain?.id,
          fromToken: sourceToken?.address,
          toToken: targetToken?.address,
        },
        fetchPolicy: "no-cache",
      });

      if (lnbridgeData.checkLnBridgeExist) {
        return true;
      }
      notification.warn({ title: "Transaction failed", description: "The bridge does not exist." });
      return false;
    },
    [sourceChain, targetChain, sourceToken, targetToken],
  );

  const sourceApprove = useCallback(
    async (amount: bigint) => {
      if (address) {
        try {
          const receipt = await bridgeInstance.sourceApprove(amount, address);
          notifyTransaction(receipt, bridgeInstance.getSourceChain());
          setSourceAllowance(await bridgeInstance.getSourceAllowance(address));
          return receipt;
        } catch (err) {
          console.error(err);
          notifyError(err);
        }
      }
    },
    [address, bridgeInstance],
  );

  const targetApprove = useCallback(
    async (amount: bigint) => {
      if (address) {
        try {
          const receipt = await bridgeInstance.targetApprove(amount, address);
          notifyTransaction(receipt, bridgeInstance.getTargetChain());
          setTargetAllowance(await bridgeInstance.getTargetAllowance(address));
          return receipt;
        } catch (err) {
          console.error(err);
          notifyError(err);
        }
      }
    },
    [address, bridgeInstance],
  );

  const updatePenaltyReserves = useCallback(async () => {
    try {
      const pr = await bridgeInstance.getPenaltyReserves(address);
      setPenaltyReserve(pr?.value);
    } catch (err) {
      console.error(err);
    }
  }, [address, bridgeInstance]);

  const depositPenaltyReserve = useCallback(
    async (amount: bigint) => {
      try {
        const receipt = await bridgeInstance.depositPenaltyReserve(amount);
        notifyTransaction(receipt, bridgeInstance.getSourceChain());
        if (address) {
          setSourceBalance(await bridgeInstance.getSourceBalance(address));
        }
        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [address, bridgeInstance],
  );

  const registerLnProvider = useCallback(
    async (baseFee: bigint, feeRate: number, transferLimit: bigint) => {
      try {
        const receipt = await bridgeInstance.registerLnProvider(baseFee, feeRate, transferLimit);
        notifyTransaction(receipt, bridgeInstance.getSourceChain());
        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [bridgeInstance],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && bridgeInstance) {
      sub$$ = forkJoin([
        bridgeInstance.getSourceAllowance(address),
        bridgeInstance.getTargetAllowance(address),
        bridgeInstance.getSourceBalance(address),
        bridgeInstance.getTargetBalance(address),
        bridgeInstance.getPenaltyReserves(address),
      ]).subscribe({
        next: ([as, at, bs, bt, pr]) => {
          setSourceAllowance(as);
          setTargetAllowance(at);
          setSourceBalance(bs);
          setTargetBalance(bt);
          setPenaltyReserve(pr?.value);
        },
        error: (err) => {
          console.error(err);
          setSourceAllowance(defaultValue.sourceAllowance);
          setTargetAllowance(defaultValue.targetAllowance);
          setSourceBalance(defaultValue.sourceBalance);
          setTargetBalance(defaultValue.targetBalance);
          setPenaltyReserve(defaultValue.penaltyReserve);
        },
      });
    } else {
      setSourceAllowance(defaultValue.sourceAllowance);
      setTargetAllowance(defaultValue.targetAllowance);
      setSourceBalance(defaultValue.sourceBalance);
      setTargetBalance(defaultValue.targetBalance);
      setPenaltyReserve(defaultValue.penaltyReserve);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [address, bridgeInstance]);

  return (
    <RelayerContext.Provider
      value={{
        sourceChain,
        targetChain,
        sourceToken,
        penaltyReserve,
        baseFee,
        feeRate,
        sourceAllowance,
        targetAllowance,
        sourceBalance,
        targetBalance,

        setSourceChain,
        setTargetChain,
        setSourceToken,
        // setPenaltyReserve,
        // setBaseFee,
        // setFeeRate,
        // setSourceAllowance,
        // setTargetAllowance,
        // setSourceBalance,
        // setTargetBalance,

        isLnBridgeExist,
        sourceApprove,
        targetApprove,
        depositPenaltyReserve,
        registerLnProvider,
        updatePenaltyReserves,
      }}
    >
      {children}
    </RelayerContext.Provider>
  );
}
