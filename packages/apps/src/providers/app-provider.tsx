"use client";

import { Dispatch, PropsWithChildren, SetStateAction, createContext, useState } from "react";

interface AppCtx {
  recordsSearch: string;
  setRecordsSearch: Dispatch<SetStateAction<string>>;
}

const defaultValue: AppCtx = {
  recordsSearch: "",
  setRecordsSearch: () => undefined,
};

export const AppContext = createContext(defaultValue);

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const [recordsSearch, setRecordsSearch] = useState(defaultValue.recordsSearch);

  return <AppContext.Provider value={{ recordsSearch, setRecordsSearch }}>{children}</AppContext.Provider>;
}
