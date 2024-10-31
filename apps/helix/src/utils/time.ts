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
    : `${formatInTimeZone(timestamp, "Africa/Abidjan", "MMM-dd-yyyy hh:mm:ss aa")} +UTC`;
}

export function formatCountdown(milliseconds: number) {
  const h = 60 * 60 * 1000;
  const m = 60 * 1000;
  const s = 1000;

  const hours = Math.floor(milliseconds / h);
  const minutes = Math.floor((milliseconds % h) / m);
  const seconds = Math.floor(((milliseconds % h) % m) / s);

  return `0${hours}`.slice(-2) + ":" + `0${minutes}`.slice(-2) + ":" + `0${seconds}`.slice(-2);
}
