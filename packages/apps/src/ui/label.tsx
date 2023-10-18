import { PropsWithChildren, ReactElement } from "react";
import Tooltip from "./tooltip";
import Image from "next/image";

interface Props {
  text: string;
  tips?: string;
  extra?: ReactElement;
  className?: string;
}

export default function Label({ text, tips, extra, className, children }: PropsWithChildren<Props>) {
  return (
    <div className={`gap-middle flex flex-col ${className}`}>
      <div className="flex items-center justify-between">
        <div className="gap-small flex items-center">
          <span className="text-sm font-normal text-white">{text}</span>
          {!!tips && (
            <Tooltip content={tips} className="w-fit">
              <Image width={16} height={16} alt="Info" src="/images/info.svg" />
            </Tooltip>
          )}
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}
