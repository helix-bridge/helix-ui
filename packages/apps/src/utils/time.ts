import { formatDistanceStrict } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function toTimeAgo(timestamp: number) {
  // 1 year ago
  return `${formatDistanceStrict(timestamp, Date.now(), {
    addSuffix: true,
  })}`;
}

export function formatTime(timestamp: number, options?: { compact?: boolean }) {
  // compact: false => Sep-08-2023 09:54:23 AM +UTC
  // compact: true => 2023-09-08 09:54:23
  return options?.compact
    ? formatInTimeZone(timestamp, "Africa/Abidjan", "yyyy-MM-dd hh:mm:ss")
    : `${formatInTimeZone(timestamp, "Africa/Abidjan", "MMM-dd-yyyy hh:mm:ss a..aa")} +UTC`;
}
