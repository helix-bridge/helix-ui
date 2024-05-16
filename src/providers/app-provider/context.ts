import { Dispatch, SetStateAction, createContext } from "react";
import { ChainConfig, Token } from "../../types";

interface AppCtx {
  balanceAll: { chain: ChainConfig; token: Token; balance: bigint }[];
  loadingBalanceAll: boolean;
  recordsSearch: string;
  setRecordsSearch: Dispatch<SetStateAction<string>>;
  updateBalanceAll: () => void;
}

export const AppContext = createContext({} as AppCtx);
