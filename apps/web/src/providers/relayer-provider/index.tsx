import { BaseBridge, LnBridgeV2Default, LnBridgeV2Opposite } from "../../bridges";
import { ChainConfig, CheckLnBridgeExistReqParams, CheckLnBridgeExistResData, Token } from "../../types";
import {
  getAvailableTargetTokens,
  isLnV2DefaultBridge,
  isLnV2OppositeBridge,
  notifyError,
  notifyTransaction,
} from "../../utils";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { Address, Hex } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Subscription, forkJoin } from "rxjs";
import { ApolloClient } from "@apollo/client";
import { GQL_CHECK_LNBRIDGE_EXIST } from "../../config";
import { RelayerCtx } from "./types";
import { RelayerContext } from "./context";

export default function RelayerProvider({ children }: PropsWithChildren<unknown>) {
  const [margin, setMargin] = useState<RelayerCtx["margin"]>();
  const [baseFee, setBaseFee] = useState<RelayerCtx["baseFee"]>();
  const [feeRate, setFeeRate] = useState<RelayerCtx["feeRate"]>();
  const [sourceAllowance, setSourceAllowance] = useState<RelayerCtx["sourceAllowance"]>();
  const [targetAllowance, setTargetAllowance] = useState<RelayerCtx["targetAllowance"]>();
  const [sourceBalance, setSourceBalance] = useState<RelayerCtx["sourceBalance"]>();
  const [targetBalance, setTargetBalance] = useState<RelayerCtx["targetBalance"]>();
  const [sourceChain, setSourceChain] = useState<RelayerCtx["sourceChain"]>();
  const [targetChain, setTargetChain] = useState<RelayerCtx["targetChain"]>();
  const [sourceToken, setSourceToken] = useState<RelayerCtx["sourceToken"]>();
  const [bridgeCategory, setBridgeCategory] = useState<RelayerCtx["bridgeCategory"]>();
  const [withdrawAmount, setWithdrawAmount] = useState<RelayerCtx["withdrawAmount"]>({
    input: "",
    valid: true,
    value: 0n,
  });

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

    if (isLnV2DefaultBridge(sourceToken, targetChain)) {
      defaultBridge = new LnBridgeV2Default({ category: "lnv2-default", ...args, protocol: "lnv2-default" });
    } else if (isLnV2OppositeBridge(sourceToken, targetChain)) {
      oppositeBridge = new LnBridgeV2Opposite({ category: "lnv2-opposite", ...args, protocol: "lnv2-opposite" });
    }
    return { defaultBridge, oppositeBridge, bridgeInstance: defaultBridge ?? oppositeBridge };
  }, [sourceChain, targetChain, sourceToken, targetToken, walletClient, publicClient]);

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
          version: "lnv2",
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
      notifyTransaction(receipt, chain, "Approval");
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
      notifyTransaction(receipt, chain, "Approval");
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
        notifyTransaction(receipt, chain, "Deposite");

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
    async (
      recipientOrParams: Address | Hex,
      amount: bigint,
      fee: bigint,
      bridge: LnBridgeV2Default,
      chain: ChainConfig,
    ) => {
      try {
        const receipt = await bridge.withdrawMargin(recipientOrParams, amount, fee);
        notifyTransaction(receipt, chain, "Withdraw");
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
          setSourceAllowance(undefined);
          setTargetAllowance(undefined);
          setSourceBalance(undefined);
          setTargetBalance(undefined);
        },
      });
    } else {
      setSourceAllowance(undefined);
      setTargetAllowance(undefined);
      setSourceBalance(undefined);
      setTargetBalance(undefined);
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
