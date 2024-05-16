import { useBalanceAll } from "../../hooks";
import { PropsWithChildren, useState } from "react";
import { AppContext } from "./context";

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
