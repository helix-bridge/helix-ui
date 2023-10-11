"use client";

import { TransferValue } from "@/components/transfer-input";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

interface TransferCtx {
  transferValue: TransferValue;
  setTransferValue: Dispatch<SetStateAction<TransferValue>>;
}

const defaultValue: TransferCtx = {
  transferValue: { value: "", formatted: 0n },
  setTransferValue: () => undefined,
};

export const TransferContext = createContext(defaultValue);

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  /**
   * Why we define here: https://react.dev/reference/react/useDeferredValue#caveats
   */
  const [transferValue, setTransferValue] = useState(defaultValue.transferValue);

  return <TransferContext.Provider value={{ transferValue, setTransferValue }}>{children}</TransferContext.Provider>;
}
