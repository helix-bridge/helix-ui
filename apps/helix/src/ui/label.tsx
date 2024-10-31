import { PropsWithChildren, ReactElement } from "react";
import Tooltip from "./tooltip";

interface Props {
  text: string;
  tips?: string;
  extra?: ReactElement | null;
  className?: string;
  textClassName?: string;
  needAbsolute?: boolean;
}

export default function Label({
  text,
  tips,
  extra,
  children,
  className,
  textClassName,
  needAbsolute,
}: PropsWithChildren<Props>) {
  return (
    <div className={`${needAbsolute ? "relative" : "gap-small flex flex-col"} ${className}`}>
      <div className={`flex items-center justify-between ${needAbsolute ? "absolute -top-7 left-0 w-full" : ""}`}>
        <div className="gap-small flex items-center">
          <span className={`text-white/50 ${textClassName}`}>{text}</span>
          {tips ? (
            <Tooltip content={tips} className="w-fit">
              <img width={16} height={16} alt="Info" src="images/info.svg" />
            </Tooltip>
          ) : null}
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}
