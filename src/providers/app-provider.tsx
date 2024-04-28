"use client";

import { useBalanceAll } from "@/hooks";
import { ChainConfig, Token } from "@/types";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

interface AppCtx {
  balanceAll: { chain: ChainConfig; token: Token; balance: bigint }[];
  loadingBalanceAll: boolean;
  recordsSearch: string;
  setRecordsSearch: Dispatch<SetStateAction<string>>;
  updateBalanceAll: () => void;
}

export const AppContext = createContext({} as AppCtx);

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const { balanceAll, loadingBalanceAll, updateBalanceAll } = useBalanceAll();
  const [recordsSearch, setRecordsSearch] = useState("");

  return (
    <AppContext.Provider
      value={{
        balanceAll,
        loadingBalanceAll,
        recordsSearch,
        setRecordsSearch,
        updateBalanceAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
