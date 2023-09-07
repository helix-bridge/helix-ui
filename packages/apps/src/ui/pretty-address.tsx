import { toShortAdrress } from "@/utils";
import Image from "next/image";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import { timer, Subscription } from "rxjs";

interface Props {
  address: string;
  copyable?: boolean;
  className?: string;
}

export default function PrettyAddress({ address, copyable, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback<MouseEventHandler<HTMLImageElement>>(
    async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
      } catch (err) {
        console.error(err);
      }
    },
    [address],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (copied) {
      sub$$ = timer(3000, 0).subscribe(() => setCopied(false));
    }
    return () => sub$$?.unsubscribe();
  }, [copied]);

  return (
    <div className="gap-small inline-flex items-center">
      <span className={`lg:hidden ${className}`}>{toShortAdrress(address)}</span>
      <span className={`hidden lg:inline`}>{address}</span>

      {copyable ? (
        copied ? (
          <Image width={18} height={18} alt="Copied" src="/images/checked.svg" className="shrink-0" />
        ) : (
          <Image
            width={18}
            height={18}
            alt="Copy"
            src="/images/copy.svg"
            className="shrink-0 transition hover:scale-105 hover:cursor-pointer hover:opacity-80 active:scale-105"
            onClick={handleCopy}
          />
        )
      ) : null}
    </div>
  );
}
