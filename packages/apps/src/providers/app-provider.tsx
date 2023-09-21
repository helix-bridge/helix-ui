"use client";

import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

interface AppCtx {
  recordsSearchValue: string;
  setRecordsSearchValue: Dispatch<SetStateAction<string>>;
}

const defaultValue: AppCtx = {
  recordsSearchValue: "",
  setRecordsSearchValue: () => undefined,
};

export const AppContext = createContext(defaultValue);

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const [recordsSearchValue, setRecordsSearchValue] = useState(defaultValue.recordsSearchValue);

  return <AppContext.Provider value={{ recordsSearchValue, setRecordsSearchValue }}>{children}</AppContext.Provider>;
}
