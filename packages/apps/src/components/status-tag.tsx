import { RecordStatus } from "@/types/graphql";
import Image from "next/image";
import { useMemo } from "react";

export function StatusTag({ status }: { status?: RecordStatus | null }) {
  const { icon, text, color } = useMemo(() => {
    let icon = "unknown.svg";
    let text = "Unknown";
    let color = "#00B2FF";

    if (
      status === RecordStatus.PENDING ||
      status === RecordStatus.PENDING_TO_REFUND ||
      status === RecordStatus.PENDING_TO_CLAIM
    ) {
      icon = "pending.svg";
      text = "Pending";
      color = "#00B2FF";
    } else if (status === RecordStatus.REFUNDED) {
      icon = "refunded.svg";
      text = "Refunded";
      color = "#FAAD14";
    } else if (status === RecordStatus.SUCCESS) {
      icon = "success.svg";
      text = "Success";
      color = "#52C41A";
    }

    return { icon, text, color };
  }, [status]);

  return (
    <div
      className="gap-small pl-small pr-middle flex items-center rounded-3xl py-[3px]"
      style={{ backgroundColor: color }}
    >
      <Image
        width={icon === "unknown.svg" ? 16 : 20}
        height={icon === "unknown.svg" ? 16 : 20}
        alt="Status"
        src={`/images/status/${icon}`}
      />
      <span className="text-sm font-medium text-white">{text}</span>
    </div>
  );
}
