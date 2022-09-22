import { fromUnixTime } from 'date-fns';

export const gqlName = (query: string) =>
  query
    .match(/\S\w+\(/g)
    ?.reverse()[0]
    .slice(0, -1) as string;

export function unixTimeToLocal(time: number) {
  const timezoneOffSet = new Date().getTimezoneOffset() * 60;

  return fromUnixTime(time - timezoneOffSet).toLocaleString();
}

export const toMiddleSplitNaming = (str: string) => {
  const result = str.replace(/[A-Z]+/g, (letter) => `-${letter.toLowerCase()}`);

  if (result.startsWith('-')) {
    return result.slice(1);
  }

  return result;
};
