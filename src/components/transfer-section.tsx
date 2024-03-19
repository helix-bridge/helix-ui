import { PropsWithChildren } from "react";
import TransferSectionTitle from "./transfer-section-title";
import WalletSVG from "./icons/wallet-svg";
import { Address } from "viem";
import RecipientInput from "./recipient-input";

interface Recipient {
  input: string;
  value: Address | undefined;
  alert?: string;
}

interface Props {
  className?: string;
  titleText?: string;
  titleTips?: string | JSX.Element;
  loading?: boolean;
  alert?: string;
  recipient?: Recipient;
  expandRecipient?: boolean;
  recipientOptions?: Address[];
  onExpandRecipient?: () => void;
  onRecipientChange?: (value: Recipient) => void;
}

export default function TransferSection({
  alert,
  loading,
  children,
  titleText,
  titleTips,
  className,
  recipient,
  expandRecipient,
  recipientOptions,
  onExpandRecipient = () => undefined,
  onRecipientChange = () => undefined,
}: PropsWithChildren<Props>) {
  return (
    <div className={`flex flex-col gap-small transition-opacity ${loading ? "opacity-80" : "opacity-100"}`}>
      <div
        className={`flex flex-col gap-medium rounded-large bg-app-bg py-medium transition-[outline] duration-200 ${className} ${
          alert ? "outline outline-1 outline-app-red" : "outline-none"
        }`}
      >
        {titleText ? (
          <div className="flex items-center justify-between px-medium">
            <TransferSectionTitle text={titleText} tips={titleTips} />
            {recipient ? (
              <WalletSVG
                className="opacity-50 transition-[transform,opacity] hover:cursor-pointer hover:opacity-100 active:scale-95"
                width={20}
                height={20}
                onClick={onExpandRecipient}
              />
            ) : null}
          </div>
        ) : null}
        {children}
        {expandRecipient && (
          <RecipientInput value={recipient} options={recipientOptions} onChange={onRecipientChange} />
        )}
      </div>
      {alert ? <span className="text-xs font-normal text-app-red">{alert}</span> : null}
    </div>
  );
}
