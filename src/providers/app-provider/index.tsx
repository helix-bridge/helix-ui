import { useBalanceAll } from "../../hooks";
import { PropsWithChildren, useState } from "react";
import { AppContext } from "./context";
import { Hash } from "viem";

export default function AppProvider({ children }: PropsWithChildren<unknown>) {
  const [historyDetailsTxHash, setHistoryDetailsTxHash] = useState<Hash | null>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [recordsSearch, setRecordsSearch] = useState("");

  const { balanceAll, loadingBalanceAll, updateBalanceAll } = useBalanceAll();

  return (
    <AppContext.Provider
      value={{
        balanceAll,
        recordsSearch,
        isHistoryOpen,
        loadingBalanceAll,
        historyDetailsTxHash,

        updateBalanceAll,
        setRecordsSearch,
        setIsHistoryOpen,
        setHistoryDetailsTxHash,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
