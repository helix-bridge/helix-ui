import Image from "next/image";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import { timer, Subscription } from "rxjs";

interface Props {
  text: string;
}

export default function CopyIcon({ text }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback<MouseEventHandler<HTMLImageElement>>(
    async (e) => {
      e.stopPropagation();
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
      } catch (err) {
        console.error(err);
      }
    },
    [text],
  );

  useEffect(() => {
    let sub$$: Subscription | undefined;
    if (copied) {
      sub$$ = timer(3000, 0).subscribe(() => setCopied(false));
    }
    return () => sub$$?.unsubscribe();
  }, [copied]);

  return copied ? (
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
  );
}
