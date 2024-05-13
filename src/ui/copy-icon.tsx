import Checked from "../components/icons/checked";
import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import { timer, Subscription } from "rxjs";

interface Props {
  text: string;
  copiedColor?: string;
}

export default function CopyIcon({ text, copiedColor }: Props) {
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
      sub$$ = timer(1000, 0).subscribe(() => setCopied(false));
    }
    return () => sub$$?.unsubscribe();
  }, [copied]);

  return copied ? (
    <Checked width={16} height={16} fill={copiedColor} />
  ) : (
    <img
      width={16}
      height={16}
      alt="Copy"
      src="images/copy.svg"
      className="shrink-0 transition hover:scale-105 hover:cursor-pointer hover:opacity-80 active:scale-105"
      onClick={handleCopy}
    />
  );
}
