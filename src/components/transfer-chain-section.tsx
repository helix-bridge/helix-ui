import { ChainConfig, Token } from "@/types";
import TransferSection from "./transfer-section";
import TransferChainSelect from "./transfer-chain-select";
import TransferSwitch from "./transfer-switch";
import ComponentLoading from "@/ui/component-loading";
import { Address } from "viem";
import Image from "next/image";
import { getTokenLogoSrc } from "@/utils";
import CopyIcon from "@/ui/copy-icon";

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
      <TransferSection
        loading={loading}
        titleText="From"
        titleTips={<TokenTips token={sourceToken} chain={sourceChain} />}
      >
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
        loading={loading}
        titleText="To"
        titleTips={<TokenTips token={targetToken} chain={targetChain} />}
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

function TokenTips({ token, chain }: { token: Token; chain: ChainConfig }) {
  const explorer = new URL(`/address/${token.address}`, chain.blockExplorers?.default.url);

  return (
    <div className="flex flex-col gap-small">
      <div className="flex items-center gap-small">
        <Image alt="Token" width={18} height={18} src={getTokenLogoSrc(token.logo)} />
        <span className="text-sm font-extrabold text-white">
          {token.symbol}
          {token.type === "native" ? " (native token)" : null}
        </span>
      </div>
      {token.type === "native" ? null : (
        <div className="inline-flex items-center gap-1">
          <a
            className="text-sm font-semibold text-white hover:underline"
            rel="noopener noreferrer"
            target="_blank"
            href={explorer.href}
          >
            {token.address}
          </a>
          <CopyIcon text={token.address} copiedColor="#ffffff" />
        </div>
      )}
    </div>
  );
}
