import { RecordResult } from "@/types";
import Image from "next/image";
import { useMemo } from "react";

export function RecordResultTag({ result }: { result?: RecordResult | null }) {
  const { icon, text, color } = useMemo(() => {
    let icon = "unknown.svg";
    let text = "Unknown";
    let color = "#00B2FF";

    if (
      result === RecordResult.PENDING ||
      result === RecordResult.PENDING_TO_REFUND ||
      result === RecordResult.PENDING_TO_CLAIM
    ) {
      icon = "pending.svg";
      text = "Pending";
      color = "#00B2FF";
    } else if (result === RecordResult.REFUNDED) {
      icon = "refunded.svg";
      text = "Refunded";
      color = "#FAAD14";
    } else if (result === RecordResult.SUCCESS) {
      icon = "success.svg";
      text = "Success";
      color = "#52C41A";
    }

    return { icon, text, color };
  }, [result]);

  return (
    <div
      className="gap-small pl-small pr-middle flex items-center rounded-3xl py-[3px]"
      style={{ backgroundColor: color }}
    >
      <Image
        width={icon === "unknown.svg" ? 16 : 20}
        height={icon === "unknown.svg" ? 16 : 20}
        alt="Result"
        src={`/images/status/${icon}`}
      />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
