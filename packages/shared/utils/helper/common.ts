import { addDays, fromUnixTime } from 'date-fns';

// eslint-disable-next-line no-magic-numbers
export const timezoneOffSet = new Date().getTimezoneOffset() * 60;

export function truth(): true {
  return true;
}

export function getTimeRange(
  startTime: number,
  duration: number
): {
  start: Date;
  end: Date;
} {
  const base = 30;
  const start = fromUnixTime(startTime);
  const end = addDays(start, base * duration);

  return { start, end };
}

export const gqlName = (query: string) =>
  query
    .match(/\S\w+\(/g)
    ?.reverse()[0]
    .slice(0, -1) as string;

export function unixTimeToLocal(time: number) {
  return fromUnixTime(time - timezoneOffSet).toLocaleString();
}
