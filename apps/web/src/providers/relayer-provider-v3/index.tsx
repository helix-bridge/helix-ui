import { LnBridgeV3 } from "../../bridges";
import { CheckLnBridgeExistReqParams, CheckLnBridgeExistResData } from "../../types";
import { extractTransferIds, getAvailableTargetTokens, notifyError, notifyTransaction } from "../../utils";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { Hex } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Subscription, forkJoin } from "rxjs";
import { ApolloClient } from "@apollo/client";
import { GQL_CHECK_LNBRIDGE_EXIST } from "../../config";
import { notification } from "../../ui/notification";
import { RelayerContext } from "./context";
import { RelayerCtx } from "./types";

export default function RelayerProviderV3({ children }: PropsWithChildren<unknown>) {
  const [sourceChain, setSourceChain] = useState<RelayerCtx["sourceChain"]>(undefined);
  const [targetChain, setTargetChain] = useState<RelayerCtx["targetChain"]>(undefined);
  const [sourceToken, setSourceToken] = useState<RelayerCtx["sourceToken"]>(undefined);
  const [penaltyReserve, setPenaltyReserve] = useState<RelayerCtx["penaltyReserve"]>(undefined);
  const [sourceAllowance, setSourceAllowance] = useState<RelayerCtx["sourceAllowance"]>(undefined);
  const [targetAllowance, setTargetAllowance] = useState<RelayerCtx["targetAllowance"]>(undefined);
  const [sourceBalance, setSourceBalance] = useState<RelayerCtx["sourceBalance"]>(undefined);
  const [targetBalance, setTargetBalance] = useState<RelayerCtx["targetBalance"]>(undefined);
  const [isGettingPenaltyReserves, setIsGettingPenaltyReserves] = useState(false);

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
        protocol: "lnv3",
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
          version: "lnv3",
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
          notifyTransaction(receipt, bridgeInstance.getSourceChain(), "Approval");
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
          notifyTransaction(receipt, bridgeInstance.getTargetChain(), "Approval");
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

  const _updatePenaltyReserves = useCallback(async () => {
    try {
      setIsGettingPenaltyReserves(true);
      const pr = await bridgeInstance.getPenaltyReserves(address);
      setIsGettingPenaltyReserves(false);
      setPenaltyReserve(pr?.value);
    } catch (err) {
      console.error(err);
      setIsGettingPenaltyReserves(false);
    }
  }, [address, bridgeInstance]);

  const depositPenaltyReserve = useCallback(
    async (amount: bigint) => {
      try {
        const receipt = await bridgeInstance.depositPenaltyReserve(amount);
        notifyTransaction(receipt, bridgeInstance.getSourceChain(), "Deposite");
        if (receipt?.status === "success") {
          await _updatePenaltyReserves();
          if (address) {
            setSourceBalance(await bridgeInstance.getSourceBalance(address));
          }
        }

        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [address, bridgeInstance, _updatePenaltyReserves],
  );

  const registerLnProvider = useCallback(
    async (baseFee: bigint, feeRate: number, transferLimit: bigint) => {
      try {
        const receipt = await bridgeInstance.registerLnProvider(baseFee, feeRate, transferLimit);
        notifyTransaction(receipt, bridgeInstance.getSourceChain(), "Register");
        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [bridgeInstance],
  );

  const withdrawPenaltyReserve = useCallback(
    async (amount: bigint) => {
      try {
        const receipt = await bridgeInstance.withdrawPenaltyReserve(amount);
        notifyTransaction(receipt, bridgeInstance.getSourceChain(), "Withdraw");

        if (receipt?.status === "success") {
          await _updatePenaltyReserves();
          if (address) {
            setSourceBalance(await bridgeInstance.getSourceBalance(address));
          }
        }
        return receipt;
      } catch (err) {
        console.error(err);
        notifyError(err);
      }
    },
    [bridgeInstance, address, _updatePenaltyReserves],
  );

  const withdrawLiquidity = useCallback(
    async (ids: { id: string }[], messageFee: bigint, params: Hex | undefined) => {
      if (address) {
        try {
          const receipt = await bridgeInstance.requestWithdrawLiquidity(
            address,
            extractTransferIds(ids.map(({ id }) => id)),
            messageFee,
            params ?? address,
          );
          notifyTransaction(receipt, bridgeInstance.getTargetChain(), "Withdraw");
          return receipt;
        } catch (err) {
          console.error(err);
          notifyError(err);
        }
      }
    },
    [bridgeInstance, address],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;

    if (address && bridgeInstance) {
      setIsGettingPenaltyReserves(true);
      sub$$ = forkJoin([
        bridgeInstance.getSourceAllowance(address),
        bridgeInstance.getTargetAllowance(address),
        bridgeInstance.getSourceBalance(address),
        bridgeInstance.getTargetBalance(address),
        bridgeInstance.getPenaltyReserves(address),
      ]).subscribe({
        next: ([as, at, bs, bt, pr]) => {
          setIsGettingPenaltyReserves(false);
          setSourceAllowance(as);
          setTargetAllowance(at);
          setSourceBalance(bs);
          setTargetBalance(bt);
          setPenaltyReserve(pr?.value);
        },
        error: (err) => {
          console.error(err);
          setIsGettingPenaltyReserves(false);
          setSourceAllowance(undefined);
          setTargetAllowance(undefined);
          setSourceBalance(undefined);
          setTargetBalance(undefined);
          setPenaltyReserve(undefined);
        },
      });
    } else {
      setSourceAllowance(undefined);
      setTargetAllowance(undefined);
      setSourceBalance(undefined);
      setTargetBalance(undefined);
      setPenaltyReserve(undefined);
    }

    return () => {
      sub$$?.unsubscribe();
    };
  }, [address, bridgeInstance]);

  return (
    <RelayerContext.Provider
      value={{
        bridgeInstance,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        penaltyReserve,
        sourceAllowance,
        targetAllowance,
        sourceBalance,
        targetBalance,
        isGettingPenaltyReserves,

        setSourceChain,
        setTargetChain,
        setSourceToken,
        // setPenaltyReserve,
        // setSourceAllowance,
        // setTargetAllowance,
        // setSourceBalance,
        // setTargetBalance,

        isLnBridgeExist,
        sourceApprove,
        targetApprove,
        depositPenaltyReserve,
        registerLnProvider,
        withdrawPenaltyReserve,
        withdrawLiquidity,
      }}
    >
      {children}
    </RelayerContext.Provider>
  );
}
