import { EMPTY } from 'rxjs';
import { addDays, fromUnixTime } from 'date-fns';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function empty(...args: any[]) {
  // nothing to do
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export function emptyObsFactory() {
  return EMPTY.subscribe();
}

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
