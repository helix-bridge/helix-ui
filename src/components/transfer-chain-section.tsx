import { ChainConfig, Token } from "@/types";
import TransferSection from "./transfer-section";
import TransferChainSelect from "./transfer-chain-select";
import TransferSwitch from "./transfer-switch";

interface Props {
  sourceChain: ChainConfig;
  targetChain: ChainConfig;
  sourceToken: Token;
  targetToken: Token;
  sourceChainOptions: ChainConfig[];
  targetChainOptions: ChainConfig[];
  sourceTokenOptions: Token[];
  targetTokenOptions: Token[];
  disableSwitch?: boolean;
  onSwitch?: () => void;
  onSourceChainChange?: (chain: ChainConfig) => void;
  onTargetChainChange?: (chain: ChainConfig) => void;
  onSourceTokenChange?: (token: Token) => void;
  onTargetTokenChange?: (token: Token) => void;
}

export default function TransferChainSection({
  disableSwitch,
  sourceChain,
  targetChain,
  sourceToken,
  targetToken,
  sourceChainOptions,
  targetChainOptions,
  sourceTokenOptions,
  targetTokenOptions,
  onSwitch,
  onSourceChainChange,
  onTargetChainChange,
  onSourceTokenChange,
  onTargetTokenChange,
}: Props) {
  return (
    <div className="flex flex-col">
      <TransferSection titleText="From">
        <TransferChainSelect
          chain={sourceChain}
          token={sourceToken}
          chainOptions={sourceChainOptions}
          tokenOptions={sourceTokenOptions}
          onChainChange={onSourceChainChange}
          onTokenChange={onSourceTokenChange}
        />
      </TransferSection>
      <TransferSwitch disabled={disableSwitch} onSwitch={onSwitch} />
      <TransferSection titleText="To">
        <TransferChainSelect
          chain={targetChain}
          token={targetToken}
          chainOptions={targetChainOptions}
          tokenOptions={targetTokenOptions}
          onChainChange={onTargetChainChange}
          onTokenChange={onTargetTokenChange}
        />
      </TransferSection>
    </div>
  );
}
