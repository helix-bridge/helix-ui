import { PropsWithChildren } from "react";
import TransferSectionTitle from "./transfer-section-title";

interface Props {
  className?: string;
  titleText?: string;
  titleTips?: string | JSX.Element;
  alert?: string;
}

export default function TransferSection({
  alert,
  children,
  titleText,
  titleTips,
  className,
}: PropsWithChildren<Props>) {
  return (
    <div className="flex flex-col gap-small">
      <div
        className={`flex flex-col gap-medium rounded-large bg-app-bg py-medium transition-[outline] duration-200 ${className} ${
          alert ? "outline outline-1 outline-app-red" : "outline-none"
        }`}
      >
        {titleText ? <TransferSectionTitle text={titleText} tips={titleTips} /> : null}
        {children}
      </div>
      {alert ? <span className="text-xs font-normal text-app-red">{alert}</span> : null}
    </div>
  );
}
