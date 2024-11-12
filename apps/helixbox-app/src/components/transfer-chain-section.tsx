import { ChainConfig, Token } from "../types";
import TransferSection from "./transfer-section";
import TransferChainSelector from "./transfer-chain-selector";
import TransferSwitch from "./transfer-switch";
import ComponentLoading from "../ui/component-loading";
import { Address } from "viem";
import { getTokenLogoSrc, toShortAdrress } from "../utils";
import CopyIcon from "../ui/copy-icon";

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
      <ComponentLoading loading={loading} className="rounded-large backdrop-blur-[2px]" icon={false} />
      <TransferSection titleText="From" titleTips={<TokenTips token={sourceToken} chain={sourceChain} />}>
        <TransferChainSelector
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
        titleTips={<TokenTips token={targetToken} chain={targetChain} />}
        recipient={recipient}
        alert={recipient?.alert}
        expandRecipient={expandRecipient}
        recipientOptions={recipientOptions}
        onExpandRecipient={onExpandRecipient}
        onRecipientChange={onRecipientChange}
      >
        <TransferChainSelector
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
    <div className="gap-small flex flex-col">
      <div className="gap-small flex items-center">
        <img alt="Token" width={18} height={18} src={getTokenLogoSrc(token.logo)} className="rounded-full" />
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
            {toShortAdrress(token.address, 12, 10)}
          </a>
          <CopyIcon text={token.address} copiedColor="#ffffff" />
        </div>
      )}
    </div>
  );
}
