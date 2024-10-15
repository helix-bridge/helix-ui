import { TData } from "../../components/history/history-table";
import { ChainConfig, Token } from "../../types";
import { Dispatch, SetStateAction } from "react";

export type HistoryDetails = TData;

export interface AppCtx {
  recordsSearch: string;
  isHistoryOpen: boolean;
  loadingBalanceAll: boolean;
  historyDetails: HistoryDetails | null | undefined;
  balanceAll: { chain: ChainConfig; token: Token; balance: bigint }[];

  updateBalanceAll: () => void;
  setRecordsSearch: Dispatch<SetStateAction<string>>;
  setIsHistoryOpen: Dispatch<SetStateAction<boolean>>;
  setHistoryDetails: Dispatch<SetStateAction<HistoryDetails | null | undefined>>;
}
