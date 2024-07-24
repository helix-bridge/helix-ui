import { HistoryRecord } from "../types/graphql";
import { formatTime, toTimeAgo } from "../utils/time";
import { formatDistanceStrict } from "date-fns";

interface Props {
  record?: HistoryRecord | null;
}

export default function TransactionTimestamp({ record }: Props) {
  return (
    <div className="gap-medium flex items-center">
      <img width={16} height={16} alt="Confirm time" src="images/time.svg" className="shrink-0" />
      <span className="text-sm font-medium text-white">
        {record ? `${toTimeAgo(record.startTime * 1000)} (${formatTime(record.startTime * 1000)})` : null}
      </span>
      {!!(record?.startTime && record?.endTime) && (
        <>
          <div className="h-3 w-[1px] bg-white/50" />
          <img width={16} height={16} alt="Confirm time" src="images/clock.svg" className="shrink-0" />
          <span className="text-sm font-medium text-white/50">
            Confirmed within {formatDistanceStrict(record.startTime * 1000, record.endTime * 1000)}
          </span>
        </>
      )}
    </div>
  );
}
