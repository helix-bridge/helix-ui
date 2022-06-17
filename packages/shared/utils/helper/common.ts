import { fromUnixTime } from 'date-fns';

export const gqlName = (query: string) =>
  query
    .match(/\S\w+\(/g)
    ?.reverse()[0]
    .slice(0, -1) as string;

export function unixTimeToLocal(time: number) {
  // eslint-disable-next-line no-magic-numbers
  const timezoneOffSet = new Date().getTimezoneOffset() * 60;

  return fromUnixTime(time - timezoneOffSet).toLocaleString();
}
