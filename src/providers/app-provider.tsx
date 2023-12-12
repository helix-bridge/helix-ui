"use client";

import { useBalances } from "@/hooks";
import { ChainConfig, Token } from "@/types";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";
import { useAccount } from "wagmi";

interface AppCtx {
  balances: { chain: ChainConfig; token: Token; balance: bigint }[];
  recordsSearch: string;
  setRecordsSearch: Dispatch<SetStateAction<string>>;
  updateBalances: () => void;
}

const defaultValue: AppCtx = {
  balances: [],
  recordsSearch: "",
  setRecordsSearch: () => undefined,
  updateBalances: () => undefined,
};

export const AppContext = createContext(defaultValue);

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const { address } = useAccount();
  const { balances, updateBalances } = useBalances(address);
  const [recordsSearch, setRecordsSearch] = useState(defaultValue.recordsSearch);

  return (
    <AppContext.Provider
      value={{
        balances,
        recordsSearch,
        setRecordsSearch,
        updateBalances,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
