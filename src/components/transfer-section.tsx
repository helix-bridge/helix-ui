import { PropsWithChildren } from "react";
import TransferSectionTitle from "./transfer-section-title";

interface Props {
  className?: string;
  titleText: string;
  titleTips?: string | JSX.Element;
}

export default function TransferSection({ children, titleText, titleTips, className }: PropsWithChildren<Props>) {
  return (
    <div className={`flex flex-col gap-medium rounded-[0.625rem] bg-app-bg p-medium ${className}`}>
      <TransferSectionTitle text={titleText} tips={titleTips} />
      {children}
    </div>
  );
}
