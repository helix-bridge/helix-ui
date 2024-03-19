import { ChainConfig, Token } from "@/types";
import TransferSection from "./transfer-section";
import TransferChainSelect from "./transfer-chain-select";
import TransferSwitch from "./transfer-switch";
import ComponentLoading from "@/ui/component-loading";
import { Address } from "viem";

interface Recipient {
  input: string;
  value: Address | undefined;
  alert?: string;
}

interface Props {
  loading?: boolean;
  recipient?: Recipient;
  sourceChain: ChainConfig;
  targetChain: ChainConfig;
  sourceToken: Token;
  targetToken: Token;
  sourceChainOptions: ChainConfig[];
  targetChainOptions: ChainConfig[];
  sourceTokenOptions: Token[];
  targetTokenOptions: Token[];
  disableSwitch?: boolean;
  expandRecipient?: boolean;
  recipientOptions?: Address[];
  onSwitch?: () => void;
  onExpandRecipient?: () => void;
  onSourceChainChange?: (chain: ChainConfig) => void;
  onTargetChainChange?: (chain: ChainConfig) => void;
  onSourceTokenChange?: (token: Token) => void;
  onTargetTokenChange?: (token: Token) => void;
  onRecipientChange?: (recipient: Recipient) => void;
}

export default function TransferChainSection({
  loading,
  recipient,
  disableSwitch,
  expandRecipient,
  recipientOptions,
  sourceChain,
  targetChain,
  sourceToken,
  targetToken,
  sourceChainOptions,
  targetChainOptions,
  sourceTokenOptions,
  targetTokenOptions,
  onSwitch,
  onExpandRecipient,
  onRecipientChange,
  onSourceChainChange,
  onTargetChainChange,
  onSourceTokenChange,
  onTargetTokenChange,
}: Props) {
  return (
    <div className="relative flex flex-col">
      <ComponentLoading loading={loading} color="white" />
      <TransferSection titleText="From" loading={loading}>
        <TransferChainSelect
          chain={sourceChain}
          token={sourceToken}
          chainOptions={sourceChainOptions}
          tokenOptions={sourceTokenOptions}
          onChainChange={onSourceChainChange}
          onTokenChange={onSourceTokenChange}
        />
      </TransferSection>
      <TransferSwitch disabled={disableSwitch || loading} onSwitch={onSwitch} />
      <TransferSection
        titleText="To"
        loading={loading}
        recipient={recipient}
        alert={recipient?.alert}
        expandRecipient={expandRecipient}
        recipientOptions={recipientOptions}
        onExpandRecipient={onExpandRecipient}
        onRecipientChange={onRecipientChange}
      >
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
