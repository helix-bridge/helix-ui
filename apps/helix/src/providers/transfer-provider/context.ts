import { Dispatch, SetStateAction, createContext } from "react";
import { ChainConfig, Token, TokenOption } from "../../types";

interface TransferCtx {
  token: TokenOption;
  availableTokenOptions: TokenOption[];
  amount: { input: string; value: bigint; valid: boolean; alert: string };
  sourceChainOptions: ChainConfig[];
  targetChainOptions: ChainConfig[];
  sourceChain: ChainConfig;
  targetChain: ChainConfig;
  sourceToken: Token;
  targetToken: Token;
  loadingSupportedChains: boolean;
  loadingAvailableTokenOptions: boolean;
  isSwitchAvailable: (sourceChain: ChainConfig, targetChain: ChainConfig) => boolean;
  setAmount: Dispatch<SetStateAction<{ input: string; value: bigint; valid: boolean; alert: string }>>;
  handleTokenChange: (value: TokenOption) => void;
  handleSourceChainChange: (value: ChainConfig) => void;
  handleTargetChainChange: (value: ChainConfig) => void;
  handleSourceTokenChange: (value: Token) => void;
  handleTargetTokenChange: (value: Token) => void;
  handleSwitch: () => void;
}

export const TransferContext = createContext({} as TransferCtx);
