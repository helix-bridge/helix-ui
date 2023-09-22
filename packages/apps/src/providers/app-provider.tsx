"use client";

import { TransferValue } from "@/components/transfer-input";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

interface AppCtx {
  recordsSearch: string;
  transferValue: TransferValue;

  setRecordsSearch: Dispatch<SetStateAction<string>>;
  setTransferValue: Dispatch<SetStateAction<TransferValue>>;
}

const defaultValue: AppCtx = {
  recordsSearch: "",
  transferValue: { value: "", formatted: 0n },

  setRecordsSearch: () => undefined,
  setTransferValue: () => undefined,
};

export const AppContext = createContext(defaultValue);

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const [recordsSearch, setRecordsSearch] = useState(defaultValue.recordsSearch);

  // why we define here
  // https://react.dev/reference/react/useDeferredValue#caveats
  const [transferValue, setTransferValue] = useState(defaultValue.transferValue);

  return (
    <AppContext.Provider value={{ recordsSearch, transferValue, setRecordsSearch, setTransferValue }}>
      {children}
    </AppContext.Provider>
  );
}
