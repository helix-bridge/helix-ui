"use client";

import { BaseBridge, LnBridgeV2Default, LnBridgeV2Opposite } from "@/bridges";
import {
  BridgeCategory,
  ChainConfig,
  CheckLnBridgeExistReqParams,
  CheckLnBridgeExistResData,
  InputValue,
  Token,
} from "@/types";
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
import { Address, TransactionReceipt } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Subscription, forkJoin } from "rxjs";
import { ApolloClient } from "@apollo/client";
import { GQL_CHECK_LNBRIDGE_EXIST } from "@/config";

interface RelayerCtx {
  margin: bigint | undefined;
  baseFee: bigint | undefined;
  feeRate: number | undefined;
  sourceAllowance: { value: bigint; token: Token } | undefined;
  targetAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;
  targetBalance: { value: bigint; token: Token } | undefined;
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  targetToken: Token | undefined;
  bridgeCategory: BridgeCategory | undefined;
  defaultBridge: LnBridgeV2Default | undefined;
  oppositeBridge: LnBridgeV2Opposite | undefined;
  withdrawAmount: InputValue<bigint>;

  setMargin: Dispatch<SetStateAction<bigint | undefined>>;
  setBaseFee: Dispatch<SetStateAction<bigint | undefined>>;
  setFeeRate: Dispatch<SetStateAction<number | undefined>>;
  setSourceAllowance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setTargetAllowance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setSourceBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setTargetBalance: Dispatch<SetStateAction<{ value: bigint; token: Token } | undefined>>;
  setSourceChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setSourceToken: Dispatch<SetStateAction<Token | undefined>>;
  setBridgeCategory: Dispatch<SetStateAction<BridgeCategory | undefined>>;
  setWithdrawAmount: Dispatch<SetStateAction<InputValue<bigint>>>;

  sourceApprove: (
    owner: Address,
    amount: bigint,
    bridge: BaseBridge,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  targetApprove: (
    owner: Address,
    amount: bigint,
    bridge: BaseBridge,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  depositMargin: (
    relayer: Address,
    margin: bigint,
    bridge: LnBridgeV2Default,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  updateFeeAndMargin: (
    relayer: Address,
    margin: bigint,
    baseFee: bigint,
    feeRate: number,
    bridge: LnBridgeV2Opposite,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  setFeeAndRate: (
    baseFee: bigint,
    feeRate: number,
    bridge: LnBridgeV2Default,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  withdrawMargin: (
    recipient: Address,
    amount: bigint,
    fee: bigint,
    bridge: LnBridgeV2Default,
    chain: ChainConfig,
  ) => Promise<TransactionReceipt | undefined>;
  isLnBridgeExist: (
    apolloClient: ApolloClient<object>,
    _sourceChain: ChainConfig,
    _targetChain: ChainConfig,
    _sourceToken: Token,
    _targetToken: Token,
  ) => Promise<boolean>;
}

const defaultValue: RelayerCtx = {
  margin: undefined,
  baseFee: undefined,
  feeRate: undefined,
  sourceAllowance: undefined,
  targetAllowance: undefined,
  sourceBalance: undefined,
  targetBalance: undefined,
  sourceChain: undefined,
  targetChain: undefined,
  sourceToken: undefined,
  targetToken: undefined,
  bridgeCategory: undefined,
  defaultBridge: undefined,
  oppositeBridge: undefined,
  withdrawAmount: { input: "", valid: true, value: 0n },

  setMargin: () => undefined,
  setBaseFee: () => undefined,
  setFeeRate: () => undefined,
  setSourceAllowance: () => undefined,
  setTargetAllowance: () => undefined,
  setSourceBalance: () => undefined,
  setTargetBalance: () => undefined,
  setSourceChain: () => undefined,
  setTargetChain: () => undefined,
  setSourceToken: () => undefined,
  setBridgeCategory: () => undefined,
  setWithdrawAmount: () => undefined,

  sourceApprove: async () => undefined,
  targetApprove: async () => undefined,
  depositMargin: async () => undefined,
  updateFeeAndMargin: async () => undefined,
  setFeeAndRate: async () => undefined,
  withdrawMargin: async () => undefined,
  isLnBridgeExist: async () => false,
};

export const RelayerContext = createContext(defaultValue);

export default function RelayerProvider({ children }: PropsWithChildren<unknown>) {
  const [margin, setMargin] = useState(defaultValue.margin);
  const [baseFee, setBaseFee] = useState(defaultValue.baseFee);
  const [feeRate, setFeeRate] = useState(defaultValue.feeRate);
  const [sourceAllowance, setSourceAllowance] = useState(defaultValue.sourceAllowance);
  const [targetAllowance, setTargetAllowance] = useState(defaultValue.targetAllowance);
  const [sourceBalance, setSourceBalance] = useState(defaultValue.sourceBalance);
  const [targetBalance, setTargetBalance] = useState(defaultValue.targetBalance);
  const [sourceChain, setSourceChain] = useState(defaultValue.sourceChain);
  const [targetChain, setTargetChain] = useState(defaultValue.targetChain);
  const [sourceToken, setSourceToken] = useState(defaultValue.sourceToken);
  const [bridgeCategory, setBridgeCategory] = useState(defaultValue.bridgeCategory);
  const [withdrawAmount, setWithdrawAmount] = useState(defaultValue.withdrawAmount);

  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const targetToken = useMemo(
    () => getAvailableTargetTokens(sourceChain, targetChain, sourceToken).at(0),
    [sourceChain, targetChain, sourceToken],
  );

  const { defaultBridge, oppositeBridge, bridgeInstance } = useMemo(() => {
    let defaultBridge: LnBridgeV2Default | undefined;
    let oppositeBridge: LnBridgeV2Opposite | undefined;
    const args = {
      sourceChain,
      targetChain,
      sourceToken,
      targetToken,
      walletClient,
      publicClient,
    };

    if (bridgeCategory === "lnv2-default") {
      defaultBridge = new LnBridgeV2Default({ category: bridgeCategory, ...args });
    } else if (bridgeCategory === "lnv2-opposite") {
      oppositeBridge = new LnBridgeV2Opposite({ category: bridgeCategory, ...args });
    }
    return { defaultBridge, oppositeBridge, bridgeInstance: defaultBridge ?? oppositeBridge };
  }, [sourceChain, targetChain, sourceToken, targetToken, bridgeCategory, walletClient, publicClient]);

  const isLnBridgeExist = useCallback(
    async (
      apolloClient: ApolloClient<object>,
      _sourceChain: ChainConfig,
      _targetChain: ChainConfig,
      _sourceToken: Token,
      _targetToken: Token,
    ) => {
      const { data: lnbridgeData } = await apolloClient.query<CheckLnBridgeExistResData, CheckLnBridgeExistReqParams>({
        query: GQL_CHECK_LNBRIDGE_EXIST,
        variables: {
          fromChainId: _sourceChain.id,
          toChainId: _targetChain.id,
          fromToken: _sourceToken.address,
          toToken: _targetToken.address,
        },
        fetchPolicy: "no-cache",
      });

      if (lnbridgeData.checkLnBridgeExist) {
        return true;
      }
      console.warn("[isLnBridgeExist]", _sourceChain.id, _targetChain.id, _sourceToken.address, _targetToken.address);
      return false;
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

  const targetApprove = useCallback(async (owner: Address, amount: bigint, bridge: BaseBridge, chain: ChainConfig) => {
    try {
      const receipt = await bridge.targetApprove(amount, owner);
      notifyTransaction(receipt, chain);
      setTargetAllowance(await bridge.getTargetAllowance(owner));
      return receipt;
    } catch (err) {
      console.error(err);
      notifyError(err);
    }
  }, []);

  /**
   * LnBridgeV2Default, on target chain
   */
  const depositMargin = useCallback(
    async (relayer: Address, margin: bigint, bridge: LnBridgeV2Default, chain: ChainConfig) => {
      try {
        const receipt = await bridge.depositMargin(margin);
        notifyTransaction(receipt, chain);

        const a = await bridge.getTargetAllowance(relayer);
        const b = await bridge.getTargetBalance(relayer);
        setTargetAllowance(a);
        setTargetBalance(b);

        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [],
  );

  /**
   * LnBridgeV2Default, on source chain
   */
  const setFeeAndRate = useCallback(
    async (baseFee: bigint, feeRate: number, bridge: LnBridgeV2Default, chain: ChainConfig) => {
      try {
        const receipt = await bridge.setFeeAndRate(baseFee, feeRate);
        notifyTransaction(receipt, chain);
        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [],
  );

  /**
   * LnBridgeOppsite, on source chain
   */
  const updateFeeAndMargin = useCallback(
    async (
      relayer: Address,
      margin: bigint,
      baseFee: bigint,
      feeRate: number,
      bridge: LnBridgeV2Opposite,
      chain: ChainConfig,
    ) => {
      try {
        const receipt = await bridge.updateFeeAndMargin(margin, baseFee, feeRate);
        notifyTransaction(receipt, chain);

        const a = await bridge.getSourceAllowance(relayer);
        const b = await bridge.getSourceBalance(relayer);
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

  const withdrawMargin = useCallback(
    async (recipient: Address, amount: bigint, fee: bigint, bridge: LnBridgeV2Default, chain: ChainConfig) => {
      try {
        const receipt = await bridge.withdrawMargin(recipient, amount, fee);
        notifyTransaction(receipt, chain);
        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && bridgeInstance) {
      sub$$ = forkJoin([
        bridgeInstance.getSourceAllowance(address),
        bridgeInstance.getTargetAllowance(address),
        bridgeInstance.getSourceBalance(address),
        bridgeInstance.getTargetBalance(address),
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
  }, [address, bridgeInstance]);

  return (
    <RelayerContext.Provider
      value={{
        margin,
        baseFee,
        feeRate,
        sourceAllowance,
        targetAllowance,
        sourceBalance,
        targetBalance,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        bridgeCategory,
        defaultBridge,
        oppositeBridge,
        withdrawAmount,

        setMargin,
        setBaseFee,
        setFeeRate,
        setSourceAllowance,
        setTargetAllowance,
        setSourceBalance,
        setTargetBalance,
        setSourceChain,
        setTargetChain,
        setSourceToken,
        setBridgeCategory,
        setWithdrawAmount,

        sourceApprove,
        targetApprove,
        depositMargin,
        updateFeeAndMargin,
        setFeeAndRate,
        withdrawMargin,
        isLnBridgeExist,
      }}
    >
      {children}
    </RelayerContext.Provider>
  );
}
