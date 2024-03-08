import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

interface TransferCtx {
  amount: { input: string; value: bigint; valid: boolean };
  setAmount: Dispatch<SetStateAction<{ input: string; value: bigint; valid: boolean }>>;
}

export const TransferContext = createContext({} as TransferCtx);

export default function TransferProviderV2({ children }: PropsWithChildren<unknown>) {
  const [amount, setAmount] = useState({ input: "", value: 0n, valid: true });
  return <TransferContext.Provider value={{ amount, setAmount }}>{children}</TransferContext.Provider>;
}
