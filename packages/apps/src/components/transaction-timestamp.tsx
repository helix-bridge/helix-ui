import { Record } from "@/types";
import { formatTime, toTimeAgo } from "@/utils";

interface Props {
  record?: Record | null;
}

export default function TransactionTimestamp({ record }: Props) {
  return (
    <span className="text-sm font-normal text-white">
      {record ? `${toTimeAgo(record.startTime)} (${formatTime(record.startTime)})` : null}
    </span>
  );
}
