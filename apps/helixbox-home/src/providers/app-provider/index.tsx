import { useBalanceAll } from "../../hooks";
import { PropsWithChildren, useState } from "react";
import { AppContext } from "./context";
import { HistoryDetails } from "./types";

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const [historyDetails, setHistoryDetails] = useState<HistoryDetails | null>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recordsSearch, setRecordsSearch] = useState("");

  const { balanceAll, loadingBalanceAll, updateBalanceAll } = useBalanceAll();

  return (
    <AppContext.Provider
      value={{
        balanceAll,
        recordsSearch,
        isHistoryOpen,
        historyDetails,
        loadingBalanceAll,

        updateBalanceAll,
        setRecordsSearch,
        setIsHistoryOpen,
        setHistoryDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
