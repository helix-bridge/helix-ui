import { Dispatch, SetStateAction, createContext } from "react";
import { ChainConfig, Token } from "../../types";
import { Hash } from "viem";

interface AppCtx {
  recordsSearch: string;
  isHistoryOpen: boolean;
  loadingBalanceAll: boolean;
  historyDetailsTxHash: Hash | null | undefined;
  balanceAll: { chain: ChainConfig; token: Token; balance: bigint }[];

  updateBalanceAll: () => void;
  setRecordsSearch: Dispatch<SetStateAction<string>>;
  setIsHistoryOpen: Dispatch<SetStateAction<boolean>>;
  setHistoryDetailsTxHash: Dispatch<SetStateAction<Hash | null | undefined>>;
}

export const AppContext = createContext({} as AppCtx);
