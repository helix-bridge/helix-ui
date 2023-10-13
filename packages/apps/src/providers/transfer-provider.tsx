"use client";

import { BaseBridge } from "@/bridges/base";
import { TransferValue } from "@/components/transfer-input";
import { BridgeCategory } from "@/types/bridge";
import { ChainConfig } from "@/types/chain";
import { Token } from "@/types/token";
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

interface TransferCtx {
  bridgeCategory: BridgeCategory | undefined;
  transferValue: TransferValue;
  sourceChain: ChainConfig | undefined;
  targetChain: ChainConfig | undefined;
  sourceToken: Token | undefined;
  targetToken: Token | undefined;
  bridgeClient: BaseBridge | undefined;
  sourceAllowance: { value: bigint; token: Token } | undefined;
  sourceBalance: { value: bigint; token: Token } | undefined;

  setTransferValue: Dispatch<SetStateAction<TransferValue>>;
  setBridgeCategory: Dispatch<SetStateAction<BridgeCategory | undefined>>;
  setSourceChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setTargetChain: Dispatch<SetStateAction<ChainConfig | undefined>>;
  setSourceToken: Dispatch<SetStateAction<Token | undefined>>;
  setTargetToken: Dispatch<SetStateAction<Token | undefined>>;
  transfer: (sender: Address, recipient: Address, amount: bigint, options?: Object) => Promise<void>;
}

const defaultValue: TransferCtx = {
  transferValue: { value: "", formatted: 0n },
  bridgeCategory: undefined,
  sourceChain: undefined,
  targetChain: undefined,
  sourceToken: undefined,
  targetToken: undefined,
  bridgeClient: undefined,
  sourceAllowance: undefined,
  sourceBalance: undefined,
  setBridgeCategory: () => undefined,
  setTransferValue: () => undefined,
  setSourceChain: () => undefined,
  setTargetChain: () => undefined,
  setSourceToken: () => undefined,
  setTargetToken: () => undefined,
  transfer: async () => undefined,
};

export const TransferContext = createContext(defaultValue);

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const [sourceAllowance, setSourceAllowance] = useState(defaultValue.sourceAllowance);
  const [sourceBalance, setSourceBalance] = useState(defaultValue.sourceBalance);

  const [transferValue, setTransferValue] = useState(defaultValue.transferValue);
  const [bridgeCategory, setBridgeCategory] = useState(defaultValue.bridgeCategory);
  const [sourceChain, setSourceChain] = useState(defaultValue.sourceChain);
  const [targetChain, setTargetChain] = useState(defaultValue.targetChain);
  const [sourceToken, setSourceToken] = useState(defaultValue.sourceToken);
  const [targetToken, setTargetToken] = useState(defaultValue.targetToken);

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

  const transfer = useCallback(
    async (sender: Address, recipient: Address, amount: bigint, options?: Object) => {
      if (address && bridgeClient) {
        try {
          await bridgeClient.transfer(sender, recipient, amount, options);
          const a = await bridgeClient.getSourceAllowance(address);
          const b = await bridgeClient.getSourceBalance(address);
          setSourceAllowance(a);
          setSourceBalance(b);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [address, bridgeClient],
  );

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

  return (
    <TransferContext.Provider
      value={{
        sourceAllowance,
        sourceBalance,
        bridgeCategory,
        bridgeClient,
        transferValue,
        sourceChain,
        targetChain,
        sourceToken,
        targetToken,
        setBridgeCategory,
        setTransferValue,
        setSourceChain,
        setTargetChain,
        setSourceToken,
        setTargetToken,
        transfer,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}
