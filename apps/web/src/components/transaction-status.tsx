import { useEffect, useState } from "react";
import { bridgeFactory } from "../utils/bridge";
import { interval } from "rxjs";
import { formatCountdown } from "../utils/time";
import { HistoryRecord, RecordResult } from "../types";
import { RecordResultTag } from "../ui/record-result-tag";

interface Props {
  record?: HistoryRecord | null;
}

export default function TransactionStatus({ record }: Props) {
  const [countdown, setCountdown] = useState(0);
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    const sub$$ = interval(1000).subscribe(() => setCountdown((prev) => (prev > 0 ? prev - 1000 : 0)));
    return () => sub$$.unsubscribe();
  }, []);

  useEffect(() => {
    if (record?.bridge) {
      const startTime = record ? record.startTime * 1000 : Date.now();
      const minTime = ((bridgeFactory({ category: record.bridge })?.getEstimateTime().min || 0) + 10) * 60 * 1000;
      setCountdown(minTime);
      setIsTimeout(Date.now() - startTime > minTime);
    } else {
      setCountdown(0);
      setIsTimeout(false);
    }
  }, [record]);

  return (
    <div className="gap-medium flex items-center">
      <RecordResultTag result={record?.result} />

      {record?.result === RecordResult.PENDING && (
        <div className="inline text-sm font-medium text-white/50">
          {isTimeout ? (
            <span>
              It seems to be taking longer than usual.{" "}
              <a
                href={`mailto:hello@helixbridge.app?subject=${encodeURIComponent(
                  "Transfer time out",
                )}&body=${encodeURIComponent(location.href)}`}
                rel="noreferrer"
                target="_blank"
                className="text-primary hover:underline"
              >
                Contact us
              </a>{" "}
              for support.
            </span>
          ) : (
            `Estimated to wait ${formatCountdown(countdown)}`
          )}
        </div>
      )}
    </div>
  );
}
